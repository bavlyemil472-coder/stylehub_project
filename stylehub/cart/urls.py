from django.urls import path
from .views import CartDetailView, AddToCartView, UpdateCartItemView, RemoveCartItemView, ClearCartView
urlpatterns = [
    path('cart/', CartDetailView.as_view(), name='cart-detail'),
    path('cart/add/', AddToCartView.as_view(), name='add-to-cart'),
    path('cart/update/<int:item_id>/', UpdateCartItemView.as_view(), name='update-cart-item'),
    path('cart/remove/<int:item_id>/', RemoveCartItemView.as_view(), name='remove-cart-item'),
    path('cart/clear/', ClearCartView.as_view(), name='clear-cart'),
]
