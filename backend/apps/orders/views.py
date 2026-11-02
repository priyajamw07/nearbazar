import uuid
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.common.mongo import get_db, serialize_doc, serialize_cursor, now_utc, to_object_id
from apps.common.permissions import IsAuthenticated, IsVendor, IsSuperAdmin
from apps.common.pagination import paginate_mongo_cursor
from apps.orders.serializers import CheckoutSerializer, StatusTransitionSerializer
from apps.cart.views import compute_cart_details
from apps.audit.service import log_audit_event

VALID_TRANSITIONS = {
    'PENDING': ['CONFIRMED', 'CANCELLED'],
    'CONFIRMED': ['PROCESSING', 'CANCELLED'],
    'PROCESSING': ['SHIPPED', 'CANCELLED'],
    'SHIPPED': ['DELIVERED'],
    'DELIVERED': [],
    'CANCELLED': []
}

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        db = get_db()
        user_id = to_object_id(request.user.id)

        # Idempotency check to prevent duplicate order submissions
        idempotency_key = data.get('idempotency_key')
        if idempotency_key:
            existing_order = db.orders.find_one({'idempotency_key': idempotency_key})
            if existing_order:
                return Response({
                    'success': True,
                    'message': 'Order retrieved from idempotent key.',
                    'order': serialize_doc(existing_order),
                    'is_replay': True
                }, status=status.HTTP_200_OK)

        # Compute live cart pricing server-side
        cart_info = compute_cart_details(db, request.user.id)
        if not cart_info['items']:
            return Response({'success': False, 'message': 'Cannot checkout with an empty cart.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate stock availability for all items
        for item in cart_info['items']:
            prod = db.products.find_one({'_id': to_object_id(item['product_id'])})
            if not prod or prod.get('stock_quantity', 0) < item['quantity']:
                return Response({
                    'success': False,
                    'message': f"Insufficient stock for {item['name']}. Available: {prod.get('stock_quantity', 0) if prod else 0}."
                }, status=status.HTTP_400_BAD_REQUEST)

        order_number = f"NBZ-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

        # Create Seller Fulfillment Orders first
        seller_order_ids = []
        seller_orders_created = []

        for shop_group in cart_info['shops']:
            shop_id_obj = to_object_id(shop_group['shop_id'])
            seller_order_doc = {
                'parent_order_number': order_number,
                'shop_id': shop_id_obj,
                'shop_name': shop_group['shop_name'],
                'customer_id': user_id,
                'customer_name': request.user.full_name,
                'items': shop_group['items'],
                'subtotal_cents': shop_group['shop_subtotal_cents'],
                'delivery_fee_cents': shop_group['delivery_fee_cents'],
                'total_cents': shop_group['shop_subtotal_cents'] + shop_group['delivery_fee_cents'],
                'status': 'PENDING',
                'status_history': [{
                    'status': 'PENDING',
                    'timestamp': now_utc(),
                    'note': 'Order placed by customer'
                }],
                'created_at': now_utc()
            }
            so_res = db.seller_orders.insert_one(seller_order_doc)
            seller_order_doc['_id'] = so_res.inserted_id
            seller_order_ids.append(so_res.inserted_id)
            seller_orders_created.append(seller_order_doc)

        # Create Parent Order
        parent_order_doc = {
            'order_number': order_number,
            'customer_id': user_id,
            'customer_name': request.user.full_name,
            'customer_phone': request.user.phone,
            'shipping_address': data['shipping_address'],
            'items': cart_info['items'],
            'subtotal_cents': cart_info['subtotal_cents'],
            'delivery_fee_cents': cart_info['delivery_fee_cents'],
            'discount_cents': cart_info['discount_cents'],
            'total_cents': cart_info['total_cents'],
            'payment_status': 'PAID' if data.get('payment_method') == 'ONLINE' else 'PENDING',
            'payment_method': data.get('payment_method', 'ONLINE'),
            'fulfillment_status': 'PROCESSING',
            'seller_order_ids': seller_order_ids,
            'idempotency_key': idempotency_key or str(uuid.uuid4()),
            'created_at': now_utc()
        }

        po_res = db.orders.insert_one(parent_order_doc)
        parent_order_doc['_id'] = po_res.inserted_id

        # Update seller orders with parent order ID reference
        db.seller_orders.update_many(
            {'_id': {'$in': seller_order_ids}},
            {'$set': {'parent_order_id': po_res.inserted_id}}
        )

        # Atomically decrement stock
        for item in cart_info['items']:
            db.products.update_one(
                {'_id': to_object_id(item['product_id'])},
                {'$inc': {'stock_quantity': -item['quantity']}}
            )

        # Clear cart
        db.carts.delete_one({'user_id': user_id})

        log_audit_event(
            actor_id=request.user.id,
            actor_email=request.user.email,
            actor_role=request.user.role,
            action='ORDER_CREATED',
            target_type='orders',
            target_id=po_res.inserted_id,
            ip_address=request.META.get('REMOTE_ADDR'),
            metadata={'order_number': order_number, 'total_cents': cart_info['total_cents']}
        )

        return Response({
            'success': True,
            'message': 'Order placed successfully! Delivery rider will bring your items Ghar Tak.',
            'order': serialize_doc(parent_order_doc),
            'seller_orders': serialize_cursor(seller_orders_created)
        }, status=status.HTTP_201_CREATED)


class CustomerOrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        db = get_db()
        orders = list(db.orders.find({'customer_id': to_object_id(request.user.id)}).sort('created_at', -1))
        return Response({'success': True, 'count': len(orders), 'results': serialize_cursor(orders)})


class CustomerOrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        db = get_db()
        obj_id = to_object_id(id)
        order = db.orders.find_one({'$or': [{'_id': obj_id}, {'order_number': id}]})
        if not order:
            return Response({'success': False, 'message': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        # Verify customer ownership (or Super Admin)
        if str(order['customer_id']) != request.user.id and request.user.role != 'SUPER_ADMIN':
            return Response({'success': False, 'message': 'Access denied to this order.'}, status=status.HTTP_403_FORBIDDEN)

        # Load linked seller fulfillment orders
        seller_orders = list(db.seller_orders.find({'_id': {'$in': order.get('seller_order_ids', [])}}))
        order_data = serialize_doc(order)
        order_data['seller_orders'] = serialize_cursor(seller_orders)

        return Response({'success': True, 'order': order_data})


class CustomerOrderCancelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        db = get_db()
        obj_id = to_object_id(id)
        order = db.orders.find_one({'$or': [{'_id': obj_id}, {'order_number': id}]})
        if not order:
            return Response({'success': False, 'message': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        if str(order['customer_id']) != request.user.id:
            return Response({'success': False, 'message': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        if order.get('fulfillment_status') in ['SHIPPED', 'DELIVERED', 'CANCELLED']:
            return Response({'success': False, 'message': f"Cannot cancel order in status '{order.get('fulfillment_status')}'."}, status=status.HTTP_400_BAD_REQUEST)

        # Cancel parent order
        db.orders.update_one({'_id': order['_id']}, {'$set': {'fulfillment_status': 'CANCELLED', 'updated_at': now_utc()}})

        # Cancel associated seller orders
        db.seller_orders.update_many(
            {'_id': {'$in': order.get('seller_order_ids', [])}},
            {'$set': {'status': 'CANCELLED'}}
        )

        # Restore product stock
        for item in order.get('items', []):
            db.products.update_one(
                {'_id': to_object_id(item['product_id'])},
                {'$inc': {'stock_quantity': item.get('quantity', 1)}}
            )

        return Response({'success': True, 'message': 'Order cancelled and stock restored.'})


class CustomerOrderTrackingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        db = get_db()
        obj_id = to_object_id(id)
        order = db.orders.find_one({'$or': [{'_id': obj_id}, {'order_number': id}]})
        if not order:
            return Response({'success': False, 'message': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'success': True,
            'tracking': {
                'order_number': order['order_number'],
                'status': order.get('fulfillment_status', 'PROCESSING'),
                'rider_name': 'Vikram Singh (Rider #402)',
                'rider_vehicle': 'NearbyBazaar Electric Scooter DL-3S-8291',
                'rider_phone': '+91 98711 00223',
                'estimated_delivery_minutes': 25,
                'delivery_box': 'NearbyBazaar Orange Insulated Bag',
                'steps': [
                    {'title': 'Order Placed', 'completed': True, 'time': order['created_at']},
                    {'title': 'Stores Packed Items', 'completed': True, 'time': '10 mins ago'},
                    {'title': 'Rider Out for Delivery', 'completed': order.get('fulfillment_status') in ['SHIPPED', 'DELIVERED'], 'time': '5 mins ago'},
                    {'title': 'Delivered Ghar Tak', 'completed': order.get('fulfillment_status') == 'DELIVERED', 'time': 'Pending'}
                ]
            }
        })


class VendorOrderListView(APIView):
    permission_classes = [IsVendor]

    def get(self, request):
        db = get_db()
        shop_id = to_object_id(request.user.shop_id)
        if not shop_id:
            return Response({'success': False, 'message': 'Vendor shop not found'}, status=status.HTTP_404_NOT_FOUND)

        orders = list(db.seller_orders.find({'shop_id': shop_id}).sort('created_at', -1))
        return Response({'success': True, 'count': len(orders), 'results': serialize_cursor(orders)})


class VendorOrderDetailView(APIView):
    permission_classes = [IsVendor]

    def get(self, request, id):
        db = get_db()
        shop_id = to_object_id(request.user.shop_id)
        obj_id = to_object_id(id)

        so = db.seller_orders.find_one({'_id': obj_id})
        if not so:
            return Response({'success': False, 'message': 'Seller order not found'}, status=status.HTTP_404_NOT_FOUND)

        # STRICT VENDOR ISOLATION CHECK
        if so.get('shop_id') != shop_id:
            return Response({'success': False, 'message': 'Access denied: You do not have permission for this shop order.'}, status=status.HTTP_403_FORBIDDEN)

        return Response({'success': True, 'order': serialize_doc(so)})


class VendorOrderTransitionView(APIView):
    permission_classes = [IsVendor]

    def post(self, request, id):
        db = get_db()
        shop_id = to_object_id(request.user.shop_id)
        obj_id = to_object_id(id)

        so = db.seller_orders.find_one({'_id': obj_id})
        if not so:
            return Response({'success': False, 'message': 'Seller order not found'}, status=status.HTTP_404_NOT_FOUND)

        # STRICT ISOLATION CHECK
        if so.get('shop_id') != shop_id:
            return Response({'success': False, 'message': 'Access denied: You do not own this order.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = StatusTransitionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        target_status = serializer.validated_data['status']
        note = serializer.validated_data.get('note', '')

        curr_status = so.get('status', 'PENDING')
        allowed_next = VALID_TRANSITIONS.get(curr_status, [])

        if target_status not in allowed_next:
            return Response({
                'success': False,
                'message': f"Invalid status transition from '{curr_status}' to '{target_status}'. Allowed transitions: {allowed_next}"
            }, status=status.HTTP_400_BAD_REQUEST)

        history_entry = {
            'status': target_status,
            'timestamp': now_utc(),
            'note': note or f"Status updated to {target_status} by shopkeeper"
        }

        db.seller_orders.update_one(
            {'_id': obj_id},
            {
                '$set': {'status': target_status, 'updated_at': now_utc()},
                '$push': {'status_history': history_entry}
            }
        )

        updated_so = db.seller_orders.find_one({'_id': obj_id})
        return Response({
            'success': True,
            'message': f"Order status transitioned to {target_status}.",
            'order': serialize_doc(updated_so)
        })


class AdminOrderListView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        db = get_db()
        orders = list(db.orders.find().sort('created_at', -1))
        return Response({'success': True, 'count': len(orders), 'results': serialize_cursor(orders)})
