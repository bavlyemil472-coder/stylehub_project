from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta

from .models import Cart, CartItem
from .serializers import CartSerializer
from products.models import ProductVariant

def cleanup_expired_carts():
    expiry_threshold = timezone.now() - timedelta(minutes=60)
    expired_items = CartItem.objects.filter(cart__updated_at__lt=expiry_threshold)
    expired_items.delete()

class CartDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cleanup_expired_carts()  
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cleanup_expired_carts()  
        variant_id = request.data.get('variant_id')
        quantity = int(request.data.get('quantity', 1))

        if quantity <= 0:
            return Response(
                {'error': 'Quantity must be greater than zero.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        variant = get_object_or_404(
            ProductVariant,
            id=variant_id,
            stock__gte=quantity
        )

        cart, created = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            variant=variant
        )

        if not created:
            cart_item.quantity += quantity
        else:
            cart_item.quantity = quantity

        if cart_item.quantity > variant.stock:
            return Response(
                {'error': 'Not enough stock for this size.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart_item.save()
        cart_item.cart.save() 
        
        return Response(
            {'message': 'Product added to cart successfully.'},
            status=status.HTTP_201_CREATED
        )

class UpdateCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, item_id):
        cleanup_expired_carts()  
        quantity = int(request.data.get('quantity', 0))

        if quantity <= 0:
            return Response(
                {'error': 'Quantity must be greater than zero.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart_item = get_object_or_404(
            CartItem,
            id=item_id,
            cart__user=request.user
        )

        if quantity > cart_item.variant.stock:
            return Response(
                {'error': 'Not enough stock for this size.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart_item.quantity = quantity
        cart_item.save()
        cart_item.cart.save() 

        return Response(
            {'message': 'Cart item updated successfully.'},
            status=status.HTTP_200_OK
        )

class RemoveCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):
        cart_item = get_object_or_404(
            CartItem,
            id=item_id,
            cart__user=request.user
        )
        cart_item.delete()

        return Response(
            {'message': 'Cart item removed successfully.'},
            status=status.HTTP_204_NO_CONTENT
        )

class ClearCartView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        cart.items.all().delete()

        return Response(
            {'message': 'Cart cleared successfully.'},
            status=status.HTTP_204_NO_CONTENT
        )
