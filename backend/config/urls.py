from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

api_v1_patterns = [
    path('auth/', include('apps.accounts.urls')),
    path('', include('apps.shops.urls')),
    path('', include('apps.catalog.urls')),
    path('', include('apps.cart.urls')),
    path('', include('apps.orders.urls')),
    path('', include('apps.delivery.urls')),
    path('', include('apps.reviews.urls')),
    path('', include('apps.promotions.urls')),
    path('', include('apps.analytics.urls')),
    path('', include('apps.support.urls')),
    path('', include('apps.payments.urls')),
    path('admin/audit-logs/', include('apps.audit.urls')),
]

urlpatterns = [
    path('api/v1/', include(api_v1_patterns)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
