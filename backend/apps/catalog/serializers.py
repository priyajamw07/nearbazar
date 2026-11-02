from rest_framework import serializers

class ProductCreateUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    category_id = serializers.CharField()
    category_name = serializers.CharField(required=False, allow_blank=True, default='')
    description = serializers.CharField(required=False, allow_blank=True, default='')
    sku = serializers.CharField(max_length=60)
    price_cents = serializers.IntegerField(min_value=0)
    compare_price_cents = serializers.IntegerField(min_value=0, required=False, default=0)
    stock_quantity = serializers.IntegerField(min_value=0)
    unit = serializers.CharField(max_length=50, default='1 unit')
    is_available = serializers.BooleanField(default=True)
    image_url = serializers.CharField(required=False, allow_blank=True, default='')

class CategorySerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    slug = serializers.CharField(max_length=100)
    icon = serializers.CharField(required=False, default='tag')
    image_url = serializers.CharField(required=False, default='')
