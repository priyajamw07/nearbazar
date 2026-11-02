from django.urls import path
from apps.promotions.views import PromotionListView, VendorDiscountView

urlpatterns = [
    path('promotions/', PromotionListView.as_view(), name='promotions'),
    path('vendor/discounts/', VendorDiscountView.as_view(), name='vendor-discounts'),
]
