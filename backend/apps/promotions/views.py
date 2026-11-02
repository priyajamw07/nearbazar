from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from apps.common.mongo import get_db, serialize_cursor, serialize_doc, now_utc, to_object_id
from apps.common.permissions import IsVendor

class PromotionListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        db = get_db()
        promos = list(db.promotions.find({'is_active': True}))
        return Response({'success': True, 'results': serialize_cursor(promos)})

class VendorDiscountView(APIView):
    permission_classes = [IsVendor]

    def get(self, request):
        db = get_db()
        shop_id = to_object_id(request.user.shop_id)
        discounts = list(db.promotions.find({'shop_id': shop_id}))
        return Response({'success': True, 'results': serialize_cursor(discounts)})

    def post(self, request):
        db = get_db()
        data = request.data
        code = data.get('code', '').strip().upper()
        if not code:
            return Response({'success': False, 'message': 'Coupon code required'}, status=status.HTTP_400_BAD_REQUEST)

        promo_doc = {
            'code': code,
            'shop_id': to_object_id(request.user.shop_id),
            'discount_percent': int(data.get('discount_percent', 10)),
            'min_order_cents': int(data.get('min_order_cents', 10000)),
            'is_active': True,
            'created_at': now_utc()
        }
        res = db.promotions.insert_one(promo_doc)
        promo_doc['_id'] = res.inserted_id
        return Response({'success': True, 'promotion': serialize_doc(promo_doc)}, status=status.HTTP_201_CREATED)
