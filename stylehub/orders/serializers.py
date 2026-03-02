from rest_framework import serializers
from .models import Order, OrderItem , ShippingRate

class OrderItemSerializer(serializers.ModelSerializer):
    total_price = serializers.SerializerMethodField()
    # بنوصل لاسم المنتج والسعر عن طريق الـ variant المرتبط بالمنتج الأصلي
    # وبنستخدم default عشان لو الـ variant ممسوح السيرفر ما يقعش
    product_name = serializers.ReadOnlyField(source='variant.product.name', default='Unknown Product')
    image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        # ملحوظة: الـ price موجود عندك كـ Field في الموديل، فمش محتاج ReadOnlyField
        fields = ['id', 'product_name', 'size', 'quantity', 'price', 'total_price', 'image']

    def get_total_price(self, obj):
        # الحسبة دي آمنة لأن السعر والكمية موجودين في الموديل كـ أرقام
        return obj.price * obj.quantity

    def get_image(self, obj):
        try:
            # بنروح للـ variant ومنه للـ product ومنه للصور
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