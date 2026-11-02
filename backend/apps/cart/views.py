from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.common.mongo import get_db, serialize_doc, now_utc, to_object_id
from apps.common.permissions import IsAuthenticated
from apps.cart.serializers import CartItemAddSerializer, CartItemUpdateSerializer

DELIVERY_FEE_PER_SHOP_CENTS = 3000  # ₹30.00 in minor units

def compute_cart_details(db, user_id):
    cart = db.carts.find_one({'user_id': to_object_id(user_id)})
    if not cart or not cart.get('items'):
        return {
            'items': [],
            'shops': [],
            'subtotal_cents': 0,
            'delivery_fee_cents': 0,
            'discount_cents': 0,
            'total_cents': 0,
            'item_count': 0
        }

    valid_items = []
    shops_map = {}
    subtotal_cents = 0

    for item in cart.get('items', []):
        prod = db.products.find_one({'_id': to_object_id(item.get('product_id'))})
        if not prod:
            continue

        shop = db.shops.find_one({'_id': prod.get('shop_id')})
        shop_name = shop.get('name', 'Local Shop') if shop else 'Local Shop'
        shop_id_str = str(prod.get('shop_id'))

        qty = max(1, item.get('quantity', 1))
        # Ensure qty doesn't exceed live stock
        available_stock = prod.get('stock_quantity', 0)
        actual_qty = min(qty, available_stock) if available_stock > 0 else 0

        item_price_cents = prod.get('price_cents', 0)
        item_total_cents = item_price_cents * actual_qty
        subtotal_cents += item_total_cents

        item_detail = {
            'product_id': str(prod['_id']),
            'shop_id': shop_id_str,
            'shop_name': shop_name,
            'name': prod.get('name'),
            'image_url': prod.get('image_url'),
            'price_cents': item_price_cents,
            'unit': prod.get('unit', '1 unit'),
            'quantity': actual_qty,
            'stock_quantity': available_stock,
            'in_stock': available_stock > 0,
            'total_cents': item_total_cents
        }
        valid_items.append(item_detail)

        if shop_id_str not in shops_map:
            shops_map[shop_id_str] = {
                'shop_id': shop_id_str,
                'shop_name': shop_name,
                'items': [],
                'shop_subtotal_cents': 0,
                'delivery_fee_cents': DELIVERY_FEE_PER_SHOP_CENTS
            }
        shops_map[shop_id_str]['items'].append(item_detail)
        shops_map[shop_id_str]['shop_subtotal_cents'] += item_total_cents

    num_shops = len(shops_map)
    total_delivery_fee_cents = num_shops * DELIVERY_FEE_PER_SHOP_CENTS if num_shops > 0 else 0
    total_cents = subtotal_cents + total_delivery_fee_cents

    return {
        'items': valid_items,
        'shops': list(shops_map.values()),
        'subtotal_cents': subtotal_cents,
        'delivery_fee_cents': total_delivery_fee_cents,
        'discount_cents': 0,
        'total_cents': total_cents,
        'item_count': sum(i['quantity'] for i in valid_items)
    }


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        db = get_db()
        details = compute_cart_details(db, request.user.id)
        return Response({'success': True, 'cart': details})

    def delete(self, request):
        db = get_db()
        db.carts.delete_one({'user_id': to_object_id(request.user.id)})
        return Response({'success': True, 'message': 'Cart cleared.'})


class CartItemAddView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CartItemAddSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        db = get_db()
        prod = db.products.find_one({'_id': to_object_id(data['product_id'])})
        if not prod:
            return Response({'success': False, 'message': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        if not prod.get('is_available') or prod.get('stock_quantity', 0) <= 0:
            return Response({'success': False, 'message': 'This product is currently out of stock.'}, status=status.HTTP_400_BAD_REQUEST)

        user_obj_id = to_object_id(request.user.id)
        cart = db.carts.find_one({'user_id': user_obj_id})

        add_qty = data['quantity']
        if not cart:
            db.carts.insert_one({
                'user_id': user_obj_id,
                'items': [{
                    'product_id': str(prod['_id']),
                    'shop_id': str(prod['shop_id']),
                    'quantity': add_qty
                }],
                'updated_at': now_utc()
            })
        else:
            items = cart.get('items', [])
            found = False
            for it in items:
                if str(it.get('product_id')) == str(prod['_id']):
                    it['quantity'] = it.get('quantity', 0) + add_qty
                    found = True
                    break
            if not found:
                items.append({
                    'product_id': str(prod['_id']),
                    'shop_id': str(prod['shop_id']),
                    'quantity': add_qty
                })
            db.carts.update_one({'_id': cart['_id']}, {'$set': {'items': items, 'updated_at': now_utc()}})

        details = compute_cart_details(db, request.user.id)
        return Response({
            'success': True,
            'message': f"Added {prod['name']} to your cart.",
            'cart': details
        }, status=status.HTTP_200_OK)


class CartItemDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        serializer = CartItemUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_qty = serializer.validated_data['quantity']

        db = get_db()
        user_obj_id = to_object_id(request.user.id)
        cart = db.carts.find_one({'user_id': user_obj_id})
        if not cart:
            return Response({'success': False, 'message': 'Cart is empty'}, status=status.HTTP_404_NOT_FOUND)

        items = cart.get('items', [])
        if new_qty <= 0:
            items = [it for it in items if str(it.get('product_id')) != str(id)]
        else:
            for it in items:
                if str(it.get('product_id')) == str(id):
                    it['quantity'] = new_qty
                    break

        db.carts.update_one({'_id': cart['_id']}, {'$set': {'items': items, 'updated_at': now_utc()}})
        details = compute_cart_details(db, request.user.id)
        return Response({'success': True, 'message': 'Cart updated.', 'cart': details})

    def delete(self, request, id):
        db = get_db()
        user_obj_id = to_object_id(request.user.id)
        cart = db.carts.find_one({'user_id': user_obj_id})
        if not cart:
            return Response({'success': False, 'message': 'Cart is empty'}, status=status.HTTP_404_NOT_FOUND)

        items = [it for it in cart.get('items', []) if str(it.get('product_id')) != str(id)]
        db.carts.update_one({'_id': cart['_id']}, {'$set': {'items': items, 'updated_at': now_utc()}})
        details = compute_cart_details(db, request.user.id)
        return Response({'success': True, 'message': 'Item removed from cart.', 'cart': details})
