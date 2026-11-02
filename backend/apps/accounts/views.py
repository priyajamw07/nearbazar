from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from apps.common.mongo import get_db, serialize_doc, now_utc, to_object_id
from apps.common.auth import (
    hash_password, verify_password, create_access_token,
    create_refresh_token, decode_token, MongoUser
)
from apps.common.permissions import IsAuthenticated
from apps.accounts.serializers import (
    RegisterSerializer, LoginSerializer, TokenRefreshSerializer, PasswordResetSerializer
)
from apps.audit.service import log_audit_event

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        db = get_db()
        email = data['email'].strip().lower()

        # Check existing user
        if db.users.find_one({'email': email}):
            return Response({
                'success': False,
                'message': 'An account with this email address already exists.'
            }, status=status.HTTP_400_BAD_REQUEST)

        role = data.get('role', 'CUSTOMER')
        user_doc = {
            'email': email,
            'password_hash': hash_password(data['password']),
            'full_name': data['full_name'].strip(),
            'phone': data.get('phone', '').strip(),
            'role': role,
            'is_active': True,
            'shop_id': None,
            'created_at': now_utc(),
            'updated_at': now_utc()
        }

        result = db.users.insert_one(user_doc)
        user_doc['_id'] = result.inserted_id

        access_token = create_access_token(user_doc)
        refresh_token = create_refresh_token(user_doc)

        log_audit_event(
            actor_id=user_doc['_id'],
            actor_email=user_doc['email'],
            actor_role=user_doc['role'],
            action='USER_REGISTERED',
            target_type='users',
            target_id=user_doc['_id'],
            ip_address=request.META.get('REMOTE_ADDR')
        )

        return Response({
            'success': True,
            'message': 'Account registered successfully.',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'id': str(user_doc['_id']),
                'email': user_doc['email'],
                'full_name': user_doc['full_name'],
                'role': user_doc['role'],
                'shop_id': None
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        db = get_db()
        email = data['email'].strip().lower()
        user_doc = db.users.find_one({'email': email})

        # Generic failure message to prevent enumeration
        invalid_resp = Response({
            'success': False,
            'message': 'Invalid email or password.'
        }, status=status.HTTP_401_UNAUTHORIZED)

        if not user_doc:
            return invalid_resp

        if not verify_password(data['password'], user_doc.get('password_hash', '')):
            return invalid_resp

        if not user_doc.get('is_active', True):
            return Response({
                'success': False,
                'message': 'This account has been suspended or deactivated.'
            }, status=status.HTTP_403_FORBIDDEN)

        access_token = create_access_token(user_doc)
        refresh_token = create_refresh_token(user_doc)

        # Retrieve linked shop info if vendor
        shop_data = None
        if user_doc.get('shop_id'):
            shop = db.shops.find_one({'_id': to_object_id(user_doc['shop_id'])})
            if shop:
                shop_data = serialize_doc(shop)

        return Response({
            'success': True,
            'message': 'Login successful.',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'id': str(user_doc['_id']),
                'email': user_doc['email'],
                'full_name': user_doc['full_name'],
                'role': user_doc['role'],
                'phone': user_doc.get('phone', ''),
                'shop_id': str(user_doc.get('shop_id', '')) if user_doc.get('shop_id') else None,
                'shop': shop_data
            }
        }, status=status.HTTP_200_OK)


class TokenRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = TokenRefreshSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        refresh_token = serializer.validated_data['refresh_token']

        payload = decode_token(refresh_token)
        if payload.get('type') != 'refresh':
            return Response({'success': False, 'message': 'Invalid token type.'}, status=status.HTTP_400_BAD_REQUEST)

        db = get_db()
        user_doc = db.users.find_one({'_id': to_object_id(payload.get('sub'))})
        if not user_doc or not user_doc.get('is_active', True):
            return Response({'success': False, 'message': 'User not found or inactive.'}, status=status.HTTP_401_UNAUTHORIZED)

        new_access_token = create_access_token(user_doc)
        return Response({
            'success': True,
            'access_token': new_access_token
        })


class PasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Always return success message to prevent user enumeration
        return Response({
            'success': True,
            'message': 'If an account exists with this email, instructions have been sent.'
        })


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        db = get_db()
        user_doc = db.users.find_one({'_id': to_object_id(request.user.id)})
        if not user_doc:
            return Response({'success': False, 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        shop_data = None
        if user_doc.get('shop_id'):
            shop = db.shops.find_one({'_id': to_object_id(user_doc['shop_id'])})
            if shop:
                shop_data = serialize_doc(shop)

        return Response({
            'success': True,
            'user': {
                'id': str(user_doc['_id']),
                'email': user_doc['email'],
                'full_name': user_doc['full_name'],
                'role': user_doc['role'],
                'phone': user_doc.get('phone', ''),
                'shop_id': str(user_doc.get('shop_id', '')) if user_doc.get('shop_id') else None,
                'shop': shop_data
            }
        })


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        return Response({'success': True, 'message': 'Logged out successfully.'})
