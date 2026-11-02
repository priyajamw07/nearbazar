from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from apps.common.mongo import get_db, serialize_cursor, serialize_doc, now_utc, to_object_id
from apps.common.permissions import IsAuthenticated

class ReviewListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request):
        db = get_db()
        query = {}
        shop_id = request.query_params.get('shop_id')
        prod_id = request.query_params.get('product_id')
        if shop_id:
            query['shop_id'] = to_object_id(shop_id)
        if prod_id:
            query['product_id'] = to_object_id(prod_id)

        reviews = list(db.reviews.find(query).sort('created_at', -1).limit(20))
        return Response({'success': True, 'count': len(reviews), 'results': serialize_cursor(reviews)})

    def post(self, request):
        db = get_db()
        data = request.data
        rating = int(data.get('rating', 5))
        comment = data.get('comment', '').strip()

        review_doc = {
            'user_id': to_object_id(request.user.id),
            'user_name': request.user.full_name,
            'shop_id': to_object_id(data.get('shop_id')),
            'product_id': to_object_id(data.get('product_id')),
            'rating': max(1, min(5, rating)),
            'comment': comment,
            'created_at': now_utc()
        }

        res = db.reviews.insert_one(review_doc)
        review_doc['_id'] = res.inserted_id

        # Update shop review metrics if applicable
        if review_doc.get('shop_id'):
            shop_reviews = list(db.reviews.find({'shop_id': review_doc['shop_id']}))
            avg_rating = sum(r['rating'] for r in shop_reviews) / len(shop_reviews)
            db.shops.update_one(
                {'_id': review_doc['shop_id']},
                {'$set': {'rating': round(avg_rating, 1), 'review_count': len(shop_reviews)}}
            )

        return Response({'success': True, 'review': serialize_doc(review_doc)}, status=status.HTTP_201_CREATED)


class WishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        db = get_db()
        user_id = to_object_id(request.user.id)
        wishlist_doc = db.wishlists.find_one({'user_id': user_id})
        prod_ids = wishlist_doc.get('product_ids', []) if wishlist_doc else []
        products = list(db.products.find({'_id': {'$in': [to_object_id(p) for p in prod_ids]}}))
        return Response({'success': True, 'count': len(products), 'results': serialize_cursor(products)})

    def post(self, request):
        db = get_db()
        user_id = to_object_id(request.user.id)
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'success': False, 'message': 'product_id required'}, status=status.HTTP_400_BAD_REQUEST)

        wishlist_doc = db.wishlists.find_one({'user_id': user_id})
        if not wishlist_doc:
            db.wishlists.insert_one({'user_id': user_id, 'product_ids': [product_id], 'updated_at': now_utc()})
            saved = True
        else:
            ids = set(wishlist_doc.get('product_ids', []))
            if product_id in ids:
                ids.remove(product_id)
                saved = False
            else:
                ids.add(product_id)
                saved = True
            db.wishlists.update_one({'_id': wishlist_doc['_id']}, {'$set': {'product_ids': list(ids), 'updated_at': now_utc()}})

        return Response({'success': True, 'saved': saved, 'message': 'Wishlist updated.'})
