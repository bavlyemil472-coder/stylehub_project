from django.contrib import admin
from .models import Order, OrderItem, ShippingRate
from import_export import resources, fields
from import_export.widgets import ForeignKeyWidget
from import_export.admin import ExportActionMixin

class OrderItemResource(resources.ModelResource):
    order_id = fields.Field(attribute='order__id', column_name='Order ID')
    user = fields.Field(attribute='order__full_name', column_name='User Name')
    city_name = fields.Field(attribute='order__city', column_name='City Name')
    payment_status = fields.Field(attribute='order__payment_method', column_name='Payment Method')
    quantity = fields.Field(attribute='quantity', column_name='quantity')
    product_name = fields.Field(attribute='product_name', column_name='Product Name')
    size = fields.Field(attribute='size', column_name='Size')
    price = fields.Field(attribute='order__total_amount', column_name='Price')

    class Meta:
        model = OrderItem
        fields = ('order_id', 'user', 'product_name', 'size', 'price', 'city_name', 'payment_status', 'quantity')
        export_order = fields


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

@admin.register(OrderItem)
class OrderItemAdmin(ExportActionMixin, admin.ModelAdmin):
    resource_class = OrderItemResource 
    list_display = ('product_name', 'order', 'price', 'quantity')
    list_filter = ('order__status', 'order__payment_status')
    list_filter = ('order__created_at', 'order__status', 'order__payment_status')
@admin.register(ShippingRate)
class ShippingRateAdmin(admin.ModelAdmin):
    list_display = ('city_name', 'price')
    search_fields = ('city_name',)