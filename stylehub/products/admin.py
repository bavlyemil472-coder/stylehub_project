from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from .models import product, Category, Section, SubCategory, Size, ProductVariant, ProductImage, Review, AnnouncementBar

# ✅ ضغط الصور
from PIL import Image
import io
from django.core.files.uploadedfile import InMemoryUploadedFile


def compress_image(img_file, quality=75, max_size_mb=8):
    """بيضغط الصورة لـ JPEG بجودة معينة"""
    try:
        img = Image.open(img_file)
        img = img.convert('RGB')
        output = io.BytesIO()
        img.save(output, format='JPEG', quality=quality, optimize=True)
        output.seek(0)
        file_name = f"{img_file.name.rsplit('.', 1)[0]}.jpg"
        return InMemoryUploadedFile(
            output, 'ImageField', file_name,
            'image/jpeg', output.getbuffer().nbytes, None
        )
    except Exception:
        return img_file  # لو فشل الضغط ارجع الأصلي


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 3
    readonly_fields = ['image_preview']

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 80px; height: 80px; border-radius: 5px; object-fit: cover;" />', obj.image.url)
        return "-"
    image_preview.short_description = "Preview"


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ('size', 'stock')


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('image_preview', 'name', 'categories_count', 'description_short')
    search_fields = ('name',)

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;" />', obj.image.url)
        return "No Image"
    image_preview.short_description = "صورة"

    def categories_count(self, obj):
        return f"{obj.categories.count()} كاتيجوري"
    categories_count.short_description = "الكاتيجوريز"

    def description_short(self, obj):
        if obj.description:
            return obj.description[:50] + "..." if len(obj.description) > 50 else obj.description
        return "-"
    description_short.short_description = "الوصف"


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('image_preview', 'name', 'section', 'subcategories_count', 'description_short')
    list_filter = ('section',)
    search_fields = ('name',)

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;" />', obj.image.url)
        return "No Image"
    image_preview.short_description = "صورة"

    def subcategories_count(self, obj):
        return f"{obj.subcategories.count()} قسم فرعي"
    subcategories_count.short_description = "الأقسام الفرعية"

    def description_short(self, obj):
        if obj.description:
            return obj.description[:50] + "..." if len(obj.description) > 50 else obj.description
        return "-"
    description_short.short_description = "الوصف"


@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    list_display = ('image_preview', 'name', 'category', 'products_count')
    list_filter = ('category', 'category__section')
    search_fields = ('name',)

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;" />', obj.image.url)
        return "No Image"
    image_preview.short_description = "صورة"

    def products_count(self, obj):
        return f"{obj.products.count()} منتج"
    products_count.short_description = "المنتجات"


@admin.register(product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('image_tag', 'name', 'price', 'discount_badge', 'category', 'subcategory', 'total_stock_display', 'is_available')
    list_filter = ('is_available', 'category', 'subcategory', 'category__section')
    search_fields = ('name',)
    inlines = [ProductImageInline, ProductVariantInline]

    def image_tag(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 45px; height: 45px; border-radius: 5px; object-fit: cover;" />', obj.image.url)
        return "No Image"
    image_tag.short_description = "صورة"

    def discount_badge(self, obj):
        if obj.discount > 0:
            return mark_safe(f'<b style="color: #d32f2f;">-{obj.discount}%</b>')
        return mark_safe('<span style="color: #aaa;">-</span>')
    discount_badge.short_description = "خصم"

    def total_stock_display(self, obj):
        total = sum(variant.stock for variant in obj.variants.all())
        return f"{total} قطع"
    total_stock_display.short_description = "إجمالي المخزون"

    # ✅ ضغط الصورة الرئيسية أوتوماتيك قبل الرفع
    def save_model(self, request, obj, form, change):
        if 'image' in request.FILES:
            obj.image = compress_image(request.FILES['image'])
        super().save_model(request, obj, form, change)


@admin.register(Size)
class SizeAdmin(admin.ModelAdmin):
    list_display = ('name',)


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ('product', 'size', 'stock', 'stock_status')
    list_editable = ('stock',)
    list_filter = ('size', 'product')
    search_fields = ('product__name',)

    def stock_status(self, obj):
        if obj.stock <= 0:
            return mark_safe('<b style="color: #d32f2f;">❌ نفذ</b>')
        elif obj.stock <= 3:
            return mark_safe('<b style="color: #f57c00;">⚠️ منخفض</b>')
        return mark_safe('<b style="color: #388e3c;">✅ متوفر</b>')
    stock_status.short_description = "حالة الاستوك"


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'image_preview')

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 100px; height: 100px; object-fit: cover;" />', obj.image.url)
        return "-"
    image_preview.short_description = "Preview"

    # ✅ ضغط الصور الإضافية أوتوماتيك
    def save_model(self, request, obj, form, change):
        if 'image' in request.FILES:
            obj.image = compress_image(request.FILES['image'])
        super().save_model(request, obj, form, change)


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'created_at')
    list_filter = ('rating',)
    search_fields = ('product__name',)


@admin.register(AnnouncementBar)
class AnnouncementBarAdmin(admin.ModelAdmin):
    list_display = ('text_preview', 'is_active', 'created_at')
    list_editable = ('is_active',)

    def text_preview(self, obj):
        return obj.text[:80] + "..." if len(obj.text) > 80 else obj.text
    text_preview.short_description = "النص"
