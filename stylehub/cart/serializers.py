from rest_framework import serializers
from .models import Cart, CartItem
from products.models import product, ProductImage, ProductVariant

# سيريالايزر الصور الإضافية لضمان ظهور p_images
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image']

# سيريالايزر عناصر السلة - أصلحنا جلب الصورة والسعر
class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='variant.product.name')
    price = serializers.ReadOnlyField(source='variant.product.price')
    size = serializers.ReadOnlyField(source='variant.size_name')
    # تعديل جلب الصورة لضمان ظهورها في السلة
    image = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product_name', 'price', 'size', 'quantity', 'image', 'variant']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.variant.product.image:
            image_url = obj.variant.product.image.url
            # السطر ده بيخلي الرابط يظهر كامل http://127.0.0.1:8000/media/...
            return request.build_absolute_uri(image_url) if request else image_url
        return None

# سيريالايزر السلة - أصلحنا اسم الحقل ليتطابق مع الـ View والـ React
class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_cart_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_cart_price', 'created_at']

    def get_total_cart_price(self, obj):
        # حساب إجمالي السلة بناءً على سعر المنتج في الكمية
        return sum(item.quantity * item.variant.product.price for item in obj.items.all())