from django.urls import path
from apps.payments.views import PaymentInitiateView, PaymentVerifyView

urlpatterns = [
    path('payments/initiate/', PaymentInitiateView.as_view(), name='payment-initiate'),
    path('payments/verify/', PaymentVerifyView.as_view(), name='payment-verify'),
]
