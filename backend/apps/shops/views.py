from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from apps.common.mongo import get_db, serialize_doc, serialize_cursor, now_utc, to_object_id
from apps.common.permissions import IsAuthenticated, IsVendor, IsSuperAdmin
from apps.common.pagination import paginate_mongo_cursor
from apps.shops.serializers import (
    ShopApplicationSerializer, DecisionSerializer, ShopUpdateSerializer, StatusUpdateSerializer
)
from apps.audit.service import log_audit_event

class ShopListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        db = get_db()
        query = {'status': 'APPROVED'}
        category = request.query_params.get('category')
        if category:
            query['category'] = category

        q = request.query_params.get('q')
        if q:
            query['name'] = {'$regex': q, '$options': 'i'}

        shops = list(db.shops.find(query).sort('rating', -1))
        return Response({
            'success': True,
            'count': len(shops),
            'results': serialize_cursor(shops)
        })


class ShopDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, id):
        db = get_db()
        obj_id = to_object_id(id)
        shop = db.shops.find_one({'$or': [{'_id': obj_id}, {'slug': id}]})
        if not shop:
            return Response({'success': False, 'message': 'Shop not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'success': True, 'shop': serialize_doc(shop)})


class ShopProductsListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, id):
        db = get_db()
        obj_id = to_object_id(id)
        shop = db.shops.find_one({'$or': [{'_id': obj_id}, {'slug': id}]})
        if not shop:
            return Response({'success': False, 'message': 'Shop not found'}, status=status.HTTP_404_NOT_FOUND)

        products = list(db.products.find({'shop_id': shop['_id'], 'is_available': True}))
        return Response({
            'success': True,
            'shop': serialize_doc(shop),
            'count': len(products),
            'results': serialize_cursor(products)
        })


class VendorShopView(APIView):
    permission_classes = [IsVendor]

    def get(self, request):
        db = get_db()
        shop_id = to_object_id(request.user.shop_id)
        if not shop_id:
            return Response({'success': False, 'message': 'No shop associated with this vendor account'}, status=status.HTTP_404_NOT_FOUND)

        shop = db.shops.find_one({'_id': shop_id})
        if not shop:
            return Response({'success': False, 'message': 'Shop profile not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'success': True, 'shop': serialize_doc(shop)})

    def patch(self, request):
        db = get_db()
        shop_id = to_object_id(request.user.shop_id)
        if not shop_id:
            return Response({'success': False, 'message': 'No shop associated with this vendor account'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ShopUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        update_data = {k: v for k, v in serializer.validated_data.items() if v is not None}
        update_data['updated_at'] = now_utc()

        db.shops.update_one({'_id': shop_id}, {'$set': update_data})
        updated_shop = db.shops.find_one({'_id': shop_id})
        return Response({'success': True, 'message': 'Shop profile updated', 'shop': serialize_doc(updated_shop)})


class ShopApplicationCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ShopApplicationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        db = get_db()
        # Verify if an existing pending application exists
        existing = db.shop_applications.find_one({
            'vendor_id': to_object_id(request.user.id),
            'status': 'PENDING'
        })
        if existing:
            return Response({
                'success': False,
                'message': 'You already have an active pending shop application under review.'
            }, status=status.HTTP_400_BAD_REQUEST)

        app_doc = {
            'vendor_id': to_object_id(request.user.id),
            'shop_name': data['shop_name'].strip(),
            'business_type': data['business_type'],
            'owner_name': data['owner_name'].strip(),
            'phone': data['phone'].strip(),
            'email': data['email'].strip().lower(),
            'address': data['address'],
            'documents': data.get('documents', []),
            'status': 'PENDING',
            'review_notes': '',
            'created_at': now_utc()
        }

        res = db.shop_applications.insert_one(app_doc)
        app_doc['_id'] = res.inserted_id

        log_audit_event(
            actor_id=request.user.id,
            actor_email=request.user.email,
            actor_role=request.user.role,
            action='SHOP_APPLICATION_SUBMITTED',
            target_type='shop_applications',
            target_id=app_doc['_id'],
            ip_address=request.META.get('REMOTE_ADDR'),
            metadata={'shop_name': app_doc['shop_name']}
        )

        return Response({
            'success': True,
            'message': 'Shop application submitted successfully. It is now awaiting Super Admin review.',
            'application': serialize_doc(app_doc)
        }, status=status.HTTP_201_CREATED)


class ShopApplicationMineView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        db = get_db()
        apps = list(db.shop_applications.find({'vendor_id': to_object_id(request.user.id)}).sort('created_at', -1))
        return Response({'success': True, 'applications': serialize_cursor(apps)})


class AdminApplicationListView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        db = get_db()
        status_filter = request.query_params.get('status')
        query = {}
        if status_filter:
            query['status'] = status_filter

        apps = list(db.shop_applications.find(query).sort('created_at', -1))
        return Response({'success': True, 'count': len(apps), 'results': serialize_cursor(apps)})


class AdminApplicationDetailView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request, id):
        db = get_db()
        obj_id = to_object_id(id)
        app = db.shop_applications.find_one({'_id': obj_id})
        if not app:
            return Response({'success': False, 'message': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'success': True, 'application': serialize_doc(app)})


class AdminApplicationDecisionView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request, id):
        db = get_db()
        obj_id = to_object_id(id)
        app = db.shop_applications.find_one({'_id': obj_id})
        if not app:
            return Response({'success': False, 'message': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = DecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        decision = serializer.validated_data['decision']
        notes = serializer.validated_data.get('review_notes', '')

        # Update application status
        db.shop_applications.update_one(
            {'_id': obj_id},
            {'$set': {
                'status': decision,
                'review_notes': notes,
                'reviewed_by': to_object_id(request.user.id),
                'reviewed_at': now_utc()
            }}
        )

        if decision == 'APPROVED':
            slug = app['shop_name'].lower().replace(' ', '-').replace('&', 'and')
            # Create shop profile
            shop_doc = {
                'vendor_id': app['vendor_id'],
                'name': app['shop_name'],
                'slug': slug,
                'category': app['business_type'],
                'description': f"Welcome to {app['shop_name']}. Local shopping delivered Ghar Tak.",
                'address': {
                    'street': app['address'],
                    'city': 'Delhi NCR',
                    'pincode': '110001'
                },
                'phone': app['phone'],
                'status': 'APPROVED',
                'rating': 5.0,
                'review_count': 0,
                'opening_time': '09:00',
                'closing_time': '21:00',
                'is_open': True,
                'image_url': '/assets/shops/default_shop.jpg',
                'created_at': now_utc()
            }
            shop_res = db.shops.insert_one(shop_doc)
            new_shop_id = shop_res.inserted_id

            # Upgrade user to VENDOR_ADMIN and link shop_id
            db.users.update_one(
                {'_id': app['vendor_id']},
                {'$set': {'role': 'VENDOR_ADMIN', 'shop_id': new_shop_id, 'updated_at': now_utc()}}
            )

        log_audit_event(
            actor_id=request.user.id,
            actor_email=request.user.email,
            actor_role=request.user.role,
            action=f"SHOP_APPLICATION_{decision}",
            target_type='shop_applications',
            target_id=obj_id,
            ip_address=request.META.get('REMOTE_ADDR'),
            metadata={'decision': decision, 'notes': notes}
        )

        return Response({
            'success': True,
            'message': f"Application has been {decision.lower()}."
        })


class AdminShopListView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        db = get_db()
        shops = list(db.shops.find().sort('created_at', -1))
        return Response({'success': True, 'count': len(shops), 'results': serialize_cursor(shops)})


class AdminShopStatusView(APIView):
    permission_classes = [IsSuperAdmin]

    def patch(self, request, id):
        db = get_db()
        obj_id = to_object_id(id)
        shop = db.shops.find_one({'_id': obj_id})
        if not shop:
            return Response({'success': False, 'message': 'Shop not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = StatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data['status']
        reason = serializer.validated_data.get('reason', '')

        db.shops.update_one({'_id': obj_id}, {'$set': {'status': new_status, 'updated_at': now_utc()}})

        log_audit_event(
            actor_id=request.user.id,
            actor_email=request.user.email,
            actor_role=request.user.role,
            action=f"SHOP_STATUS_{new_status}",
            target_type='shops',
            target_id=obj_id,
            ip_address=request.META.get('REMOTE_ADDR'),
            metadata={'new_status': new_status, 'reason': reason}
        )

        return Response({'success': True, 'message': f"Shop status updated to {new_status}"})


class AdminUserListView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        db = get_db()
        users = list(db.users.find({}, {'password_hash': 0}).sort('created_at', -1))
        return Response({'success': True, 'count': len(users), 'results': serialize_cursor(users)})


class AdminUserStatusView(APIView):
    permission_classes = [IsSuperAdmin]

    def patch(self, request, id):
        db = get_db()
        obj_id = to_object_id(id)
        user = db.users.find_one({'_id': obj_id})
        if not user:
            return Response({'success': False, 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        is_active = request.data.get('is_active')
        if is_active is None:
            return Response({'success': False, 'message': 'is_active boolean required'}, status=status.HTTP_400_BAD_REQUEST)

        db.users.update_one({'_id': obj_id}, {'$set': {'is_active': bool(is_active), 'updated_at': now_utc()}})

        action_name = "USER_ACTIVATED" if is_active else "USER_SUSPENDED"
        log_audit_event(
            actor_id=request.user.id,
            actor_email=request.user.email,
            actor_role=request.user.role,
            action=action_name,
            target_type='users',
            target_id=obj_id,
            ip_address=request.META.get('REMOTE_ADDR')
        )

        return Response({'success': True, 'message': f"User account has been {'activated' if is_active else 'suspended'}."})
