import cloudinary
from rest_framework import serializers
from .models import product, Category, Section, SubCategory, ProductVariant, ProductImage, Review


def get_optimized_url(image_field, width=800):
    """
    Helper function to build optimized Cloudinary URL.
    - f_auto: converts to WebP automatically
    - q_auto: smart quality compression
    - w_{width}: resize width
    - crop=limit: won't upscale if image is smaller
    """
    if not image_field:
        return None
    return cloudinary.CloudinaryImage(str(image_field)).build_url(
        fetch_format="auto",
        quality="auto",
        width=width,
        crop="limit"
    )


class SubCategorySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = SubCategory
        fields = ('id', 'name', 'image', 'description')

    def get_image(self, obj):
        return get_optimized_url(obj.image, width=400)


class CategorySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    subcategories = SubCategorySerializer(many=True, read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)

    class Meta:
        model = Category
        fields = ('id', 'name', 'image', 'description', 'section_name', 'subcategories')

    def get_image(self, obj):
        return get_optimized_url(obj.image, width=400)


class SectionSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    categories = CategorySerializer(many=True, read_only=True)

    class Meta:
        model = Section
        fields = ('id', 'name', 'image', 'description', 'categories')

    def get_image(self, obj):
        return get_optimized_url(obj.image, width=600)


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ('id', 'image')

    def get_image(self, obj):
        # صور المنتج التفصيلية ممكن تكون أكبر شوية
        return get_optimized_url(obj.image, width=1200)


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
    image = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False)
    subcategory = SubCategorySerializer(read_only=True)
    subcategory_id = serializers.IntegerField(write_only=True, required=False)
    variants = ProductVariantSerializer(many=True, read_only=True)
    p_images = ProductImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    other_colors = serializers.SerializerMethodField()
    total_sold = serializers.SerializerMethodField()

    class Meta:
        model = product
        fields = (
            'id', 'name', 'description', 'price', 'image',
            'is_available', 'created_at',
            'category', 'category_id',
            'subcategory', 'subcategory_id',
            'variants', 'p_images', 'color_name', 'color_hex',
            'other_colors', 'reviews', 'average_rating', 'review_count',
            'total_sold',
        )

    def get_image(self, obj):
        # الصورة الرئيسية للمنتج في اللستات
        return get_optimized_url(obj.image, width=800)

    def get_average_rating(self, obj):
        from django.db.models import Avg
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0

    def get_review_count(self, obj):
        return obj.reviews.count()

    def get_total_sold(self, obj):
        from orders.models import OrderItem
        from django.db.models import Sum
        result = OrderItem.objects.filter(
            variant__product=obj
        ).aggregate(total=Sum('quantity'))
        return result['total'] or 0

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
        subcategory_id = validated_data.pop('subcategory_id', None)
        if category_id:
            validated_data['category_id'] = category_id
        if subcategory_id:
            validated_data['subcategory_id'] = subcategory_id
        return super().create(validated_data)
