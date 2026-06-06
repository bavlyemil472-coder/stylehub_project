from django.contrib import admin
from django.utils.html import format_html
from .models import Order, OrderItem, ShippingRate
from import_export import resources, fields
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
    shipping_price = fields.Field(attribute='order__shipping_price', column_name='Shipping Price')  # ✅

    class Meta:
        model = OrderItem
        fields = ('order_id', 'user', 'product_name', 'size', 'price', 'shipping_price', 'city_name', 'payment_status', 'quantity')
        export_order = fields


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_name', 'size', 'price', 'quantity')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    # ✅ ضيف shipping_price في العرض
    list_display = ('id', 'full_name', 'city', 'subtotal_display', 'shipping_price', 'total_amount', 'status', 'payment_method', 'payment_status', 'created_at')
    list_filter = ('status', 'payment_status', 'payment_method', 'city')
    search_fields = ('id', 'full_name', 'phone', 'user__email')
    inlines = [OrderItemInline]
    readonly_fields = ('total_amount', 'shipping_price', 'created_at', 'payment_screenshot_preview', 'subtotal_display')

    fieldsets = (
        ('بيانات العميل', {
            'fields': ('user', 'full_name', 'phone', 'address', 'city')
        }),
        ('الفاتورة', {
            'fields': ('subtotal_display', 'shipping_price', 'total_amount')
        }),
        ('الدفع', {
            'fields': ('payment_method', 'payment_status', 'transaction_id', 'payment_screenshot_preview', 'payment_notes')
        }),
        ('حالة الطلب', {
            'fields': ('status', 'created_at')
        }),
    )

    def subtotal_display(self, obj):
        subtotal = float(obj.total_amount) - float(obj.shipping_price)
        return f"{subtotal:.2f} EGP"
    subtotal_display.short_description = "سعر المنتجات"

    def payment_screenshot_preview(self, obj):
        if obj.payment_screenshot:
            return format_html(
                '<img src="{}" style="max-width:300px; border: 2px solid #ddd; border-radius: 8px;"/>',
                obj.payment_screenshot.url
            )
        return "لا يوجد إيصال"
    payment_screenshot_preview.short_description = "إيصال الدفع"


@admin.register(OrderItem)
class OrderItemAdmin(ExportActionMixin, admin.ModelAdmin):
    resource_class = OrderItemResource
    list_display = ('product_name', 'order', 'size', 'price', 'quantity')
    list_filter = ('order__created_at', 'order__status', 'order__payment_status')
    search_fields = ('product_name', 'order__full_name')


@admin.register(ShippingRate)
class ShippingRateAdmin(admin.ModelAdmin):
    list_display = ('city_name', 'price')
    search_fields = ('city_name',)
