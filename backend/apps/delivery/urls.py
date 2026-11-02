from django.urls import path
from apps.delivery.views import AddressListCreateView, AddressDetailView

urlpatterns = [
    path('addresses/', AddressListCreateView.as_view(), name='address-list-create'),
    path('addresses/<str:id>/', AddressDetailView.as_view(), name='address-detail'),
]
