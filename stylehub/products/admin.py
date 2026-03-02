from django.contrib import admin
from django.utils.html import format_html
from .models import product, category, Size, ProductVariant, ProductImage # أضفنا ProductImage هنا

# 1. إضافة الصور الإضافية داخل صفحة المنتج
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 3 # عدد الخانات الفارغة التي تظهر افتراضياً للرفع
    readonly_fields = ['image_preview']

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 80px; height: 80px; border-radius: 5px; object-fit: cover;" />', obj.image.url)
        return "-"
    image_preview.short_description = "Preview"

# 2. إضافة المقاسات داخل صفحة المنتج
class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1

@admin.register(product)
class ProductAdmin(admin.ModelAdmin):
    # عرض معلومات المنتج الأساسية ومعاينة الصورة في الجدول الرئيسي
    list_display = ('image_tag', 'name', 'price', 'category', 'is_available')
    list_filter = ('is_available', 'category')
    search_fields = ('name',)
    
    # دمج ألبوم الصور والمقاسات في صفحة تعديل المنتج
    inlines = [ProductImageInline, ProductVariantInline]

    def image_tag(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 45px; height: 45px; border-radius: 5px; object-fit: cover;" />', obj.image.url)
        return "No Image"
    image_tag.short_description = "Main Image"

@admin.register(category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description_short', 'image_preview')
    search_fields = ('name',)

    def description_short(self, obj):
        if obj.description:
            return obj.description[:50] + "..." if len(obj.description) > 50 else obj.description
        return "-"
    description_short.short_description = "Description"

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;" />', obj.image.url)
        return "No Image"
    image_preview.short_description = "Preview"

@admin.register(Size)
class SizeAdmin(admin.ModelAdmin):
    list_display = ('name',)

# اختياري: إذا أردت إدارة الصور بشكل منفصل أيضاً
@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'image_preview')
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 100px; height: 100px; object-fit: cover;" />', obj.image.url)
        return "-"