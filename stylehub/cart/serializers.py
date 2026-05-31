from rest_framework import serializers
from .models import Cart, CartItem
from products.models import product, ProductImage, ProductVariant

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image']

class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='variant.product.name')
    price = serializers.ReadOnlyField(source='variant.product.price')
    size = serializers.ReadOnlyField(source='variant.size_name')
    image = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product_name', 'price', 'size', 'quantity', 'image', 'variant']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.variant.product.image:
            image_url = obj.variant.product.image.url
            return request.build_absolute_uri(image_url) if request else image_url
        return None

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_cart_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_cart_price', 'created_at']

    def get_total_cart_price(self, obj):
        return sum(item.quantity * item.variant.product.price for item in obj.items.all())
