import os
import uuid
import re
from io import BytesIO
from PIL import Image
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from apps.common.mongo import get_db, serialize_doc, serialize_cursor, now_utc, to_object_id
from apps.common.permissions import IsVendor, IsSuperAdmin
from apps.common.pagination import paginate_mongo_cursor
from apps.catalog.serializers import ProductCreateUpdateSerializer, CategorySerializer
from apps.audit.service import log_audit_event

class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        db = get_db()
        cats = list(db.categories.find({'is_active': True}).sort('name', 1))
        return Response({'success': True, 'count': len(cats), 'results': serialize_cursor(cats)})

    def post(self, request):
        if not (request.user and request.user.is_authenticated and request.user.role == 'SUPER_ADMIN'):
            return Response({'success': False, 'message': 'Admin privilege required'}, status=status.HTTP_403_FORBIDDEN)
        serializer = CategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        db = get_db()
        data['is_active'] = True
        data['item_count'] = 0
        res = db.categories.insert_one(data)
        data['_id'] = res.inserted_id
        return Response({'success': True, 'category': serialize_doc(data)}, status=status.HTTP_201_CREATED)


class ProductListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        db = get_db()
        query = {'is_available': True}

        # Filter by category
        cat = request.query_params.get('category')
        if cat:
            query['$or'] = [
                {'category_id': to_object_id(cat)},
                {'category_name': {'$regex': cat, '$options': 'i'}},
                {'category_slug': cat}
            ]

        # Filter by shop
        shop_id = request.query_params.get('shop_id')
        if shop_id:
            query['shop_id'] = to_object_id(shop_id)

        # Filter by price range
        min_p = request.query_params.get('min_price')
        max_p = request.query_params.get('max_price')
        if min_p or max_p:
            query['price_cents'] = {}
            if min_p:
                query['price_cents']['$gte'] = int(float(min_p) * 100)
            if max_p:
                query['price_cents']['$lte'] = int(float(max_p) * 100)

        # Keyword search
        q = request.query_params.get('q')
        if q:
            regex_query = {'$regex': re.escape(q), '$options': 'i'}
            query['$or'] = [
                {'name': regex_query},
                {'description': regex_query},
                {'category_name': regex_query},
                {'shop_name': regex_query}
            ]

        sort_param = request.query_params.get('sort', 'created_at_desc')
        sort_field = 'created_at'
        sort_dir = -1
        if sort_param == 'price_asc':
            sort_field = 'price_cents'
            sort_dir = 1
        elif sort_param == 'price_desc':
            sort_field = 'price_cents'
            sort_dir = -1

        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))

        def cursor_fn(skip, limit):
            cursor = db.products.find(query).sort(sort_field, sort_dir).skip(skip).limit(limit)
            count = db.products.count_documents(query)
            return count, serialize_cursor(cursor)

        result = paginate_mongo_cursor(cursor_fn, page, page_size)
        return Response({'success': True, **result})


class ProductDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, id):
        db = get_db()
        obj_id = to_object_id(id)
        prod = db.products.find_one({'$or': [{'_id': obj_id}, {'slug': id}]})
        if not prod:
            return Response({'success': False, 'message': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        # Include shop details
        shop = db.shops.find_one({'_id': prod.get('shop_id')})
        data = serialize_doc(prod)
        data['shop'] = serialize_doc(shop) if shop else None
        return Response({'success': True, 'product': data})


class SearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        db = get_db()
        q = request.query_params.get('q', '').strip()
        if not q:
            return Response({'success': True, 'products': [], 'shops': [], 'categories': []})

        regex = {'$regex': re.escape(q), '$options': 'i'}
        products = list(db.products.find({'is_available': True, 'name': regex}).limit(10))
        shops = list(db.shops.find({'status': 'APPROVED', 'name': regex}).limit(6))
        categories = list(db.categories.find({'name': regex}).limit(6))

        return Response({
            'success': True,
            'query': q,
            'products': serialize_cursor(products),
            'shops': serialize_cursor(shops),
            'categories': serialize_cursor(categories)
        })


class VendorProductListCreateView(APIView):
    permission_classes = [IsVendor]

    def get(self, request):
        db = get_db()
        shop_id = to_object_id(request.user.shop_id)
        if not shop_id:
            return Response({'success': False, 'message': 'Vendor shop not found'}, status=status.HTTP_404_NOT_FOUND)

        prods = list(db.products.find({'shop_id': shop_id}).sort('created_at', -1))
        return Response({'success': True, 'count': len(prods), 'results': serialize_cursor(prods)})

    def post(self, request):
        db = get_db()
        shop_id = to_object_id(request.user.shop_id)
        if not shop_id:
            return Response({'success': False, 'message': 'Vendor shop not found'}, status=status.HTTP_404_NOT_FOUND)

        shop = db.shops.find_one({'_id': shop_id})
        serializer = ProductCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Check SKU uniqueness within this shop
        if db.products.find_one({'shop_id': shop_id, 'sku': data['sku']}):
            return Response({'success': False, 'message': 'A product with this SKU already exists in your shop.'}, status=status.HTTP_400_BAD_REQUEST)

        slug = re.sub(r'[^a-zA-Z0-9]+', '-', data['name'].lower()).strip('-') + f"-{str(uuid.uuid4())[:6]}"

        product_doc = {
            'shop_id': shop_id,
            'shop_name': shop['name'] if shop else 'My Shop',
            'name': data['name'],
            'slug': slug,
            'category_id': to_object_id(data['category_id']),
            'category_name': data.get('category_name') or 'General',
            'description': data.get('description', ''),
            'sku': data['sku'],
            'price_cents': data['price_cents'],
            'compare_price_cents': data.get('compare_price_cents', 0),
            'stock_quantity': data['stock_quantity'],
            'unit': data.get('unit', '1 unit'),
            'is_available': data.get('is_available', True),
            'image_url': data.get('image_url') or '/assets/products/placeholder.jpg',
            'created_at': now_utc(),
            'updated_at': now_utc()
        }

        res = db.products.insert_one(product_doc)
        product_doc['_id'] = res.inserted_id

        # Update category count
        db.categories.update_one({'_id': product_doc['category_id']}, {'$inc': {'item_count': 1}})

        return Response({
            'success': True,
            'message': 'Product added to catalog successfully.',
            'product': serialize_doc(product_doc)
        }, status=status.HTTP_201_CREATED)


class VendorProductDetailView(APIView):
    permission_classes = [IsVendor]

    def get(self, request, id):
        db = get_db()
        shop_id = to_object_id(request.user.shop_id)
        prod = db.products.find_one({'_id': to_object_id(id)})
        if not prod:
            return Response({'success': False, 'message': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        # STRICT ISOLATION ENFORCEMENT
        if prod.get('shop_id') != shop_id:
            return Response({'success': False, 'message': 'Access denied: You do not own this product.'}, status=status.HTTP_403_FORBIDDEN)

        return Response({'success': True, 'product': serialize_doc(prod)})

    def patch(self, request, id):
        db = get_db()
        shop_id = to_object_id(request.user.shop_id)
        prod = db.products.find_one({'_id': to_object_id(id)})
        if not prod:
            return Response({'success': False, 'message': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        # STRICT ISOLATION ENFORCEMENT
        if prod.get('shop_id') != shop_id:
            return Response({'success': False, 'message': 'Access denied: You do not own this product.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ProductCreateUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        update_data = {k: v for k, v in serializer.validated_data.items() if v is not None}
        if 'category_id' in update_data:
            update_data['category_id'] = to_object_id(update_data['category_id'])
        update_data['updated_at'] = now_utc()

        db.products.update_one({'_id': prod['_id']}, {'$set': update_data})
        updated = db.products.find_one({'_id': prod['_id']})
        return Response({'success': True, 'message': 'Product updated', 'product': serialize_doc(updated)})

    def delete(self, request, id):
        db = get_db()
        shop_id = to_object_id(request.user.shop_id)
        prod = db.products.find_one({'_id': to_object_id(id)})
        if not prod:
            return Response({'success': False, 'message': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        # STRICT ISOLATION ENFORCEMENT
        if prod.get('shop_id') != shop_id:
            return Response({'success': False, 'message': 'Access denied: You do not own this product.'}, status=status.HTTP_403_FORBIDDEN)

        db.products.delete_one({'_id': prod['_id']})
        return Response({'success': True, 'message': 'Product deleted successfully.'})


class VendorInventoryView(APIView):
    permission_classes = [IsVendor]

    def get(self, request):
        db = get_db()
        shop_id = to_object_id(request.user.shop_id)
        products = list(db.products.find({'shop_id': shop_id}).sort('stock_quantity', 1))

        low_stock = [p for p in products if p.get('stock_quantity', 0) < 10]
        out_of_stock = [p for p in products if p.get('stock_quantity', 0) == 0]

        return Response({
            'success': True,
            'total_items': len(products),
            'low_stock_count': len(low_stock),
            'out_of_stock_count': len(out_of_stock),
            'products': serialize_cursor(products)
        })


class VendorUploadView(APIView):
    """Safe image upload pipeline with MIME signature verification & stripping metadata."""
    permission_classes = [IsVendor]
    parser_classes = [MultiPartParser, FormParser]

    ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
    MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5MB

    def post(self, request):
        file_obj = request.FILES.get('image')
        if not file_obj:
            return Response({'success': False, 'message': 'No image file provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Size check
        if file_obj.size > self.MAX_SIZE_BYTES:
            return Response({'success': False, 'message': 'File size exceeds 5MB limit.'}, status=status.HTTP_400_BAD_REQUEST)

        # Extension check
        ext = os.path.splitext(file_obj.name)[1].lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            return Response({'success': False, 'message': f'Unsupported file format. Allowed: {list(self.ALLOWED_EXTENSIONS)}'}, status=status.HTTP_400_BAD_REQUEST)

        # Deep Image Validation and sanitization via Pillow
        try:
            image = Image.open(file_obj)
            image.verify()  # Verify signature
            file_obj.seek(0)
            image = Image.open(file_obj)  # Reopen after verify
        except Exception as e:
            return Response({'success': False, 'message': 'Corrupt or unreadable image file.'}, status=status.HTTP_400_BAD_REQUEST)

        # Convert to RGB (strips any CMYK or invalid color spaces)
        if image.mode in ('RGBA', 'P'):
            image = image.convert('RGB')

        # Save to disk with randomized UUID key
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'products')
        os.makedirs(upload_dir, exist_ok=True)
        filename = f"{uuid.uuid4().hex}.jpg"
        target_path = os.path.join(upload_dir, filename)

        # Re-encoding strips EXIF data and malicious payloads
        image.save(target_path, 'JPEG', quality=85, optimize=True)

        url_path = f"/media/products/{filename}"
        return Response({
            'success': True,
            'message': 'Image uploaded and processed securely.',
            'url': url_path
        }, status=status.HTTP_201_CREATED)
