from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.common.mongo import get_db, now_utc, to_object_id
from apps.common.permissions import IsAuthenticated
from apps.payments.service import PaymentGatewayService

class PaymentInitiateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('order_id')
        if not order_id:
            return Response({'success': False, 'message': 'order_id required'}, status=status.HTTP_400_BAD_REQUEST)

        db = get_db()
        order = db.orders.find_one({'_id': to_object_id(order_id)})
        if not order:
            return Response({'success': False, 'message': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        payment_data = PaymentGatewayService.create_payment_order(
            str(order['_id']), order['total_cents']
        )
        return Response({'success': True, 'payment': payment_data})

class PaymentVerifyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        order_id = data.get('order_id')
        amount_cents = data.get('amount_cents')
        tx_id = data.get('transaction_id')
        signature = data.get('signature')

        if not all([order_id, amount_cents, tx_id, signature]):
            return Response({'success': False, 'message': 'Missing signature validation parameters'}, status=status.HTTP_400_BAD_REQUEST)

        is_valid = PaymentGatewayService.verify_payment_callback(order_id, amount_cents, tx_id, signature)
        if not is_valid:
            return Response({'success': False, 'message': 'Cryptographic payment signature verification failed.'}, status=status.HTTP_400_BAD_REQUEST)

        db = get_db()
        db.orders.update_one(
            {'_id': to_object_id(order_id)},
            {'$set': {'payment_status': 'PAID', 'payment_id': tx_id, 'updated_at': now_utc()}}
        )

        return Response({
            'success': True,
            'message': 'Payment verified successfully.',
            'transaction_id': tx_id
        })
