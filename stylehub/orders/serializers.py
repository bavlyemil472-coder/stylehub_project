from rest_framework import serializers
from .models import Order, OrderItem , ShippingRate

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
            if product.images.exists():
                return product.images.first().image.url
        except:
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
