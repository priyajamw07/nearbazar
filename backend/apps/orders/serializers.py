from rest_framework import serializers

class CheckoutSerializer(serializers.Serializer):
    shipping_address = serializers.DictField()
    payment_method = serializers.ChoiceField(choices=['ONLINE', 'COD'], default='ONLINE')
    idempotency_key = serializers.CharField(max_length=128, required=False, default='')
    notes = serializers.CharField(required=False, allow_blank=True, default='')

class StatusTransitionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
    note = serializers.CharField(required=False, allow_blank=True, default='')
