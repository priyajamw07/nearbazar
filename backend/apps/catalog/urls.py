from django.urls import path
from apps.catalog.views import (
    CategoryListView, ProductListView, ProductDetailView, SearchView,
    VendorProductListCreateView, VendorProductDetailView, VendorInventoryView, VendorUploadView
)

urlpatterns = [
    # Public Catalog
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/<str:id>/', ProductDetailView.as_view(), name='product-detail'),
    path('search/', SearchView.as_view(), name='catalog-search'),

    # Vendor Operations
    path('vendor/products/', VendorProductListCreateView.as_view(), name='vendor-products'),
    path('vendor/products/<str:id>/', VendorProductDetailView.as_view(), name='vendor-product-detail'),
    path('vendor/inventory/', VendorInventoryView.as_view(), name='vendor-inventory'),
    path('vendor/uploads/', VendorUploadView.as_view(), name='vendor-uploads'),
]
