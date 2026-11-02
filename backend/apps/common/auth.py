from datetime import datetime, timedelta, timezone
import jwt
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password
from rest_framework import authentication, exceptions
from apps.common.mongo import get_db, to_object_id

class MongoUser:
    """Lightweight user model representing a MongoDB authenticated user entity."""
    def __init__(self, doc):
        self.id = str(doc.get('_id'))
        self._id = doc.get('_id')
        self.email = doc.get('email', '')
        self.full_name = doc.get('full_name', '')
        self.role = doc.get('role', 'CUSTOMER')  # CUSTOMER, VENDOR_ADMIN, SUPER_ADMIN
        self.phone = doc.get('phone', '')
        self.shop_id = str(doc.get('shop_id')) if doc.get('shop_id') else None
        self.is_active = doc.get('is_active', True)

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    @property
    def is_superuser(self):
        return self.role == 'SUPER_ADMIN'

    @property
    def is_vendor(self):
        return self.role == 'VENDOR_ADMIN'

    @property
    def is_customer(self):
        return self.role == 'CUSTOMER'

    def __str__(self):
        return f"{self.email} ({self.role})"


def hash_password(plain_text: str) -> str:
    return make_password(plain_text)

def verify_password(plain_text: str, hashed: str) -> bool:
    return check_password(plain_text, hashed)

def create_access_token(user_doc: dict) -> str:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=getattr(settings, 'JWT_ACCESS_MINUTES', 60))
    payload = {
        'sub': str(user_doc['_id']),
        'email': user_doc.get('email', ''),
        'role': user_doc.get('role', 'CUSTOMER'),
        'shop_id': str(user_doc.get('shop_id', '')),
        'name': user_doc.get('full_name', ''),
        'iat': int(now.timestamp()),
        'exp': int(exp.timestamp()),
        'type': 'access'
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

def create_refresh_token(user_doc: dict) -> str:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(days=getattr(settings, 'JWT_REFRESH_DAYS', 7))
    payload = {
        'sub': str(user_doc['_id']),
        'iat': int(now.timestamp()),
        'exp': int(exp.timestamp()),
        'type': 'refresh'
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

def decode_token(token_str: str) -> dict:
    try:
        return jwt.decode(token_str, settings.SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        raise exceptions.AuthenticationFailed('Authentication token has expired.')
    except jwt.InvalidTokenError:
        raise exceptions.AuthenticationFailed('Invalid authentication token.')


class MongoJWTAuthentication(authentication.BaseAuthentication):
    """DRF Authentication Class mapping verified JWT bearer tokens to MongoUser."""
    
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None

        token = parts[1]
        payload = decode_token(token)

        if payload.get('type') != 'access':
            raise exceptions.AuthenticationFailed('Token type must be access.')

        user_id = payload.get('sub')
        db = get_db()
        user_doc = db.users.find_one({'_id': to_object_id(user_id)})

        if not user_doc:
            raise exceptions.AuthenticationFailed('User corresponding to token not found.')

        if not user_doc.get('is_active', True):
            raise exceptions.AuthenticationFailed('User account is suspended or inactive.')

        return (MongoUser(user_doc), token)
