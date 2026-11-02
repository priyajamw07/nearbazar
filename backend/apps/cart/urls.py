from django.urls import path
from apps.cart.views import CartView, CartItemAddView, CartItemDetailView

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart-detail'),
    path('cart/items/', CartItemAddView.as_view(), name='cart-item-add'),
    path('cart/items/<str:id>/', CartItemDetailView.as_view(), name='cart-item-detail'),
]
