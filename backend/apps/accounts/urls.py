from django.urls import path
from apps.accounts.views import (
    RegisterView, LoginView, TokenRefreshView, PasswordResetView, MeView, LogoutView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='auth-token-refresh'),
    path('password-reset/', PasswordResetView.as_view(), name='auth-password-reset'),
    path('me/', MeView.as_view(), name='auth-me'),
]
