from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from .models import product, category, Size, ProductVariant, ProductImage

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

@admin.register(product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('image_tag', 'name', 'price', 'category', 'total_stock_display', 'is_available')
    list_filter = ('is_available', 'category')
    search_fields = ('name',)
    
    inlines = [ProductImageInline, ProductVariantInline]

    def image_tag(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 45px; height: 45px; border-radius: 5px; object-fit: cover;" />', obj.image.url)
        return "No Image"
    image_tag.short_description = "Main Image"

    def total_stock_display(self, obj):
        total = sum(variant.stock for variant in obj.variants.all())
        return f"{total} قطع"
    total_stock_display.short_description = "إجمالي المخزون"

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