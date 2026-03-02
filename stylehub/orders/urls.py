from django.urls import path
from .views import CreateOrderView, MyOrdersView, StartPaymentView,paymob_webhook, ShippingRateListView, AdminDashboardStatsView,AdminOrderListView

urlpatterns = [
    path('orders/create/', CreateOrderView.as_view(), name='create-order'),
    path('orders/my/', MyOrdersView.as_view(), name='my-orders'),
    path('pay/<int:order_id>/', StartPaymentView.as_view()),
    path('webhook/paymob/', paymob_webhook),
    path('shipping-rates/', ShippingRateListView.as_view(), name='shipping-rates'),
    path('admin-stats/', AdminDashboardStatsView.as_view(), name='admin-stats'),
    path('admin/orders/', AdminOrderListView.as_view(), name='admin-orders-list'),
    path('admin/orders/<int:pk>/', AdminOrderListView.as_view(), name='admin-order-patch'),
]