from django.urls import path
from apps.support.views import SupportTicketListCreateView, AdminSupportListView

urlpatterns = [
    path('support/', SupportTicketListCreateView.as_view(), name='support-tickets'),
    path('admin/support/', AdminSupportListView.as_view(), name='admin-support-list'),
    path('admin/support/<str:id>/', AdminSupportListView.as_view(), name='admin-support-detail'),
]
