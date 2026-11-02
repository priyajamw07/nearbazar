from django.urls import path
from apps.orders.views import (
    CheckoutView, CustomerOrderListView, CustomerOrderDetailView,
    CustomerOrderCancelView, CustomerOrderTrackingView,
    VendorOrderListView, VendorOrderDetailView, VendorOrderTransitionView,
    AdminOrderListView
)

urlpatterns = [
    # Customer Orders
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('orders/', CustomerOrderListView.as_view(), name='customer-orders'),
    path('orders/<str:id>/', CustomerOrderDetailView.as_view(), name='customer-order-detail'),
    path('orders/<str:id>/cancel/', CustomerOrderCancelView.as_view(), name='customer-order-cancel'),
    path('orders/<str:id>/tracking/', CustomerOrderTrackingView.as_view(), name='customer-order-tracking'),

    # Vendor Fulfillment
    path('vendor/orders/', VendorOrderListView.as_view(), name='vendor-orders'),
    path('vendor/orders/<str:id>/', VendorOrderDetailView.as_view(), name='vendor-order-detail'),
    path('vendor/orders/<str:id>/transition/', VendorOrderTransitionView.as_view(), name='vendor-order-transition'),

    # Super Admin Order Monitoring
    path('admin/orders/', AdminOrderListView.as_view(), name='admin-orders'),
]
