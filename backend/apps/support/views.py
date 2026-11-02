from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.common.mongo import get_db, serialize_cursor, serialize_doc, now_utc, to_object_id
from apps.common.permissions import IsAuthenticated, IsSuperAdmin

class SupportTicketListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        db = get_db()
        tickets = list(db.support_tickets.find({'user_id': to_object_id(request.user.id)}).sort('created_at', -1))
        return Response({'success': True, 'results': serialize_cursor(tickets)})

    def post(self, request):
        db = get_db()
        data = request.data
        subject = data.get('subject', '').strip()
        message = data.get('message', '').strip()
        if not subject or not message:
            return Response({'success': False, 'message': 'Subject and message are required.'}, status=status.HTTP_400_BAD_REQUEST)

        ticket_doc = {
            'user_id': to_object_id(request.user.id),
            'user_email': request.user.email,
            'user_name': request.user.full_name,
            'subject': subject,
            'message': message,
            'status': 'OPEN',
            'priority': data.get('priority', 'NORMAL'),
            'created_at': now_utc()
        }
        res = db.support_tickets.insert_one(ticket_doc)
        ticket_doc['_id'] = res.inserted_id
        return Response({'success': True, 'ticket': serialize_doc(ticket_doc)}, status=status.HTTP_201_CREATED)

class AdminSupportListView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        db = get_db()
        tickets = list(db.support_tickets.find().sort('created_at', -1))
        return Response({'success': True, 'results': serialize_cursor(tickets)})

    def patch(self, request, id):
        db = get_db()
        status_val = request.data.get('status', 'RESOLVED')
        db.support_tickets.update_one({'_id': to_object_id(id)}, {'$set': {'status': status_val, 'updated_at': now_utc()}})
        return Response({'success': True, 'message': f'Ticket updated to {status_val}'})
