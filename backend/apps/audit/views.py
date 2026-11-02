from rest_framework.views import APIView
from rest_framework.response import Response
from apps.common.mongo import get_db, serialize_cursor
from apps.common.permissions import IsSuperAdmin
from apps.common.pagination import paginate_mongo_cursor

class AdminAuditLogListView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        db = get_db()
        page = request.query_params.get('page', 1)
        page_size = request.query_params.get('page_size', 20)

        def cursor_fn(skip, limit):
            cursor = db.audit_logs.find().sort('created_at', -1).skip(skip).limit(limit)
            count = db.audit_logs.count_documents({})
            return count, serialize_cursor(cursor)

        result = paginate_mongo_cursor(cursor_fn, page, page_size)
        return Response({'success': True, **result})
