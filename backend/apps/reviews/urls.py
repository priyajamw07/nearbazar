from django.urls import path
from apps.reviews.views import ReviewListCreateView, WishlistView

urlpatterns = [
    path('reviews/', ReviewListCreateView.as_view(), name='reviews'),
    path('wishlist/', WishlistView.as_view(), name='wishlist'),
]
