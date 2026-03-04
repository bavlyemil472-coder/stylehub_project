from django.contrib import admin
from .models import Order, OrderItem ,ShippingRate


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_name', 'size', 'price', 'quantity')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_amount', 'status', 'payment_status', 'created_at')
    list_filter = ('status', 'payment_status')
    search_fields = ('id', 'user__email')
    inlines = [OrderItemInline]
    
    readonly_fields = ('total_amount', 'created_at', 'payment_screenshot_preview')

    def payment_screenshot_preview(self, obj):
        if obj.payment_screenshot:
            from django.utils.html import format_html
            return format_html('<img src="{}" style="max-width:300px; border: 2px solid #ddd; border-radius: 8px;"/>', obj.payment_screenshot.url)
        return "No screenshot uploaded"

@admin.register(ShippingRate)
class ShippingRateAdmin(admin.ModelAdmin):
    list_display = ('city_name', 'price')
    search_fields = ('city_name',)