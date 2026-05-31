import re
from rest_framework import serializers
from .models import Order, OrderItem, ShippingRate


def get_optimized_url(image_field, width=800):
    if not image_field:
        return None
    url = image_field.url
    match = re.search(r'/upload/(?:[^/]+/)*([^/]+)$', url)
    if not match:
        return url
    public_id = match.group(1)
    base_url = url.split('/upload/')[0]
    return f"{base_url}/upload/f_auto,q_auto,w_{width},c_limit/{public_id}"


class OrderItemSerializer(serializers.ModelSerializer):
    total_price = serializers.SerializerMethodField()
    product_name = serializers.ReadOnlyField(source='variant.product.name', default='Unknown Product')
    image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'size', 'quantity', 'price', 'total_price', 'image']

    def get_total_price(self, obj):
        return obj.price * obj.quantity

    def get_image(self, obj):
        try:
            product = obj.variant.product
            if product.image:
                return get_optimized_url(product.image, width=400)
            if product.p_images.exists():
                return get_optimized_url(product.p_images.first().image, width=400)
        except Exception:
            return None
        return None


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = '__all__'


class ShippingRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingRate
        fields = ['id', 'city_name', 'price']
