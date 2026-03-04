from rest_framework import serializers
from .models import product, category, ProductVariant, ProductImage, Review


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = category
        fields = ('id', 'name', 'image', 'description')

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ('id', 'image')

class ProductVariantSerializer(serializers.ModelSerializer):
    size_name = serializers.CharField(source='size.name', read_only=True)
    class Meta:
        model = ProductVariant
        fields = ('id', 'size_name', 'stock')


class ColorVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = product
        fields = ['id', 'color_name', 'color_hex'] 

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Review
        fields = ['id', 'user_name', 'rating', 'comment', 'created_at']

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    p_images = ProductImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    
    other_colors = serializers.SerializerMethodField()

    class Meta:
        model = product
        fields = (
            'id', 'name', 'description', 'price', 'image', 
            'is_available', 'created_at', 'category', 'category_id',
            'variants', 'p_images', 'color_name', 'color_hex', 'other_colors', 'reviews', 'average_rating', 'review_count'
        )

    def get_average_rating(self, obj):
        from django.db.models import Avg
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0

    def get_review_count(self, obj):
        return obj.reviews.count()

    def get_other_colors(self, obj):
        if obj.parent_product:
            siblings = product.objects.filter(parent_product=obj.parent_product).exclude(id=obj.id)
            parent = product.objects.filter(id=obj.parent_product.id)
            qs = siblings | parent
        else:
            qs = obj.color_variants.all()
            
        return ColorVariantSerializer(qs, many=True).data

    def create(self, validated_data):
        category_id = validated_data.pop('category_id', None)
        if category_id:
            validated_data['category_id'] = category_id
        return super().create(validated_data)

