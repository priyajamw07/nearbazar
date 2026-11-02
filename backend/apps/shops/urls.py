from django.urls import path
from apps.shops.views import (
    ShopListView, ShopDetailView, ShopProductsListView,
    VendorShopView, ShopApplicationCreateView, ShopApplicationMineView,
    AdminApplicationListView, AdminApplicationDetailView, AdminApplicationDecisionView,
    AdminShopListView, AdminShopStatusView, AdminUserListView, AdminUserStatusView
)

urlpatterns = [
    # Public Shops
    path('shops/', ShopListView.as_view(), name='shop-list'),
    path('shops/<str:id>/', ShopDetailView.as_view(), name='shop-detail'),
    path('shops/<str:id>/products/', ShopProductsListView.as_view(), name='shop-products-list'),

    # Vendor Shop
    path('vendor/shop/', VendorShopView.as_view(), name='vendor-shop'),

    # Shop Applications
    path('shop-applications/', ShopApplicationCreateView.as_view(), name='shop-app-create'),
    path('shop-applications/mine/', ShopApplicationMineView.as_view(), name='shop-app-mine'),

    # Super Admin Operations
    path('admin/applications/', AdminApplicationListView.as_view(), name='admin-apps-list'),
    path('admin/applications/<str:id>/', AdminApplicationDetailView.as_view(), name='admin-app-detail'),
    path('admin/applications/<str:id>/decision/', AdminApplicationDecisionView.as_view(), name='admin-app-decision'),
    path('admin/shops/', AdminShopListView.as_view(), name='admin-shops-list'),
    path('admin/shops/<str:id>/status/', AdminShopStatusView.as_view(), name='admin-shop-status'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-users-list'),
    path('admin/users/<str:id>/status/', AdminUserStatusView.as_view(), name='admin-user-status'),
]
