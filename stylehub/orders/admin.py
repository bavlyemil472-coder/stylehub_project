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
    readonly_fields = ('total_amount', 'created_at')

@admin.register(ShippingRate)
class ShippingRateAdmin(admin.ModelAdmin):
    list_display = ('city_name', 'price')
    search_fields = ('city_name',)