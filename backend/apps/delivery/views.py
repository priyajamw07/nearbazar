from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.common.mongo import get_db, serialize_cursor, serialize_doc, now_utc, to_object_id
from apps.common.permissions import IsAuthenticated

class AddressListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        db = get_db()
        addresses = list(db.addresses.find({'user_id': to_object_id(request.user.id)}).sort('created_at', -1))
        return Response({'success': True, 'results': serialize_cursor(addresses)})

    def post(self, request):
        db = get_db()
        data = request.data
        if not data.get('street') or not data.get('city') or not data.get('pincode'):
            return Response({'success': False, 'message': 'Street, city, and pincode are required.'}, status=status.HTTP_400_BAD_REQUEST)

        address_doc = {
            'user_id': to_object_id(request.user.id),
            'title': data.get('title', 'Home'),
            'street': data.get('street'),
            'landmark': data.get('landmark', ''),
            'city': data.get('city'),
            'state': data.get('state', 'Delhi NCR'),
            'pincode': data.get('pincode'),
            'phone': data.get('phone', request.user.phone),
            'is_default': data.get('is_default', False),
            'created_at': now_utc()
        }

        if address_doc['is_default']:
            db.addresses.update_many({'user_id': address_doc['user_id']}, {'$set': {'is_default': False}})

        res = db.addresses.insert_one(address_doc)
        address_doc['_id'] = res.inserted_id
        return Response({'success': True, 'address': serialize_doc(address_doc)}, status=status.HTTP_201_CREATED)

class AddressDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        db = get_db()
        db.addresses.delete_one({'_id': to_object_id(id), 'user_id': to_object_id(request.user.id)})
        return Response({'success': True, 'message': 'Address removed.'})
