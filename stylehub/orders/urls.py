from django.urls import path
from .views import (
    CreateOrderView,
    MyOrdersView,
    StartPaymentView,
    paymob_webhook,
    ShippingRateListView,
    AdminDashboardStatsView,
    AdminOrderListView,
    AdminTopProductsView,
    AdminSalesChartView
)

app_name = "orders"

urlpatterns = [

    # Orders
    path("orders/create/", CreateOrderView.as_view(), name="create_order"),
    path("orders/my/", MyOrdersView.as_view(), name="my_orders"),

    # Payment
    path("pay/<int:order_id>/", StartPaymentView.as_view(), name="start_payment"),
    path("webhook/paymob/", paymob_webhook, name="paymob_webhook"),

    # Shipping
    path("shipping-rates/", ShippingRateListView.as_view(), name="shipping_rates"),

    # Admin Dashboard
    path("admin/stats/", AdminDashboardStatsView.as_view(), name="admin_stats"),

    # Admin Orders
    path("admin/orders/", AdminOrderListView.as_view(), name="admin_orders"),
    path("admin/orders/<int:pk>/", AdminOrderListView.as_view(), name="admin_order_update"),
    path("admin/top-products/", AdminTopProductsView.as_view(), name="admin-top-products"),
    path("admin/sales-chart/", AdminSalesChartView.as_view(), name="admin-sales-chart"),
]