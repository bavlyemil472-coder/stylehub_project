import re
from rest_framework import serializers
from .models import Cart, CartItem
from products.models import product, ProductImage, ProductVariant


def get_optimized_url(image_field, width=400):
    if not image_field:
        return None
    url = image_field.url
    url = re.sub(
        r'/upload/([^/]+/)*',
        f'/upload/f_auto,q_auto,w_{width},c_limit/',
        url,
        count=1
    )
    return url


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
        try:
            product_obj = obj.variant.product
            if product_obj.image:
                return get_optimized_url(product_obj.image, width=400)
            first_image = product_obj.p_images.first()
            if first_image:
                return get_optimized_url(first_image.image, width=400)
        except Exception:
            return None
        return None


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_cart_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_cart_price', 'created_at']

    def get_total_cart_price(self, obj):
        return sum(item.quantity * item.variant.product.price for item in obj.items.all())
