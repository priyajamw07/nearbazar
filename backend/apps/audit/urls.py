from django.urls import path
from apps.audit.views import AdminAuditLogListView

urlpatterns = [
    path('', AdminAuditLogListView.as_view(), name='admin-audit-logs'),
]
