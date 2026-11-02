from rest_framework import serializers

class ShopApplicationSerializer(serializers.Serializer):
    shop_name = serializers.CharField(max_length=150)
    business_type = serializers.CharField(max_length=80)
    owner_name = serializers.CharField(max_length=120)
    phone = serializers.CharField(max_length=20)
    email = serializers.EmailField()
    address = serializers.CharField(max_length=250)
    documents = serializers.ListField(child=serializers.CharField(), required=False, default=list)

class DecisionSerializer(serializers.Serializer):
    decision = serializers.ChoiceField(choices=['APPROVED', 'REJECTED'])
    review_notes = serializers.CharField(required=False, allow_blank=True, default='')

class ShopUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(required=False)
    description = serializers.CharField(required=False, allow_blank=True)
    opening_time = serializers.CharField(required=False)
    closing_time = serializers.CharField(required=False)
    is_open = serializers.BooleanField(required=False)
    phone = serializers.CharField(required=False)
    image_url = serializers.CharField(required=False)

class StatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['ACTIVE', 'SUSPENDED', 'APPROVED', 'REJECTED'])
    reason = serializers.CharField(required=False, allow_blank=True, default='')
