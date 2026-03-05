from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from django.db import transaction

from .models import Cart, CartItem
from .serializers import CartSerializer
from products.models import ProductVariant

def cleanup_expired_carts():
    expiry_threshold = timezone.now() - timedelta(minutes=60)
    expired_items = CartItem.objects.filter(cart__updated_at__lt=expiry_threshold)
    
    with transaction.atomic():
        for item in expired_items:
            variant = item.variant
            variant.stock += item.quantity
            variant.save()
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
            return Response({'error': 'Quantity must be greater than zero.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            variant = get_object_or_404(ProductVariant, id=variant_id)

            if variant.stock < quantity:
                return Response({'error': 'Not enough stock available.'}, status=status.HTTP_400_BAD_REQUEST)

            cart, created = Cart.objects.get_or_create(user=request.user)
            cart_item, item_created = CartItem.objects.get_or_create(cart=cart, variant=variant)

            if not item_created:
                cart_item.quantity += quantity
            else:
                cart_item.quantity = quantity

            variant.stock -= quantity
            variant.save()
            cart_item.save()
            cart_item.cart.save() 
        
        return Response({'message': 'Product added and stock reserved.'}, status=status.HTTP_201_CREATED)

class UpdateCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, item_id):
        cleanup_expired_carts()  
        new_quantity = int(request.data.get('quantity', 0))

        if new_quantity <= 0:
            return Response({'error': 'Quantity must be greater than zero.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
            variant = cart_item.variant
            
            diff = new_quantity - cart_item.quantity

            if diff > 0:
                if variant.stock < diff:
                    return Response({'error': 'Not enough stock for this update.'}, status=status.HTTP_400_BAD_REQUEST)
                variant.stock -= diff
            elif diff < 0:
                variant.stock += abs(diff)

            variant.save()
            cart_item.quantity = new_quantity
            cart_item.save()
            cart_item.cart.save() 

        return Response({'message': 'Cart updated and stock adjusted.'}, status=status.HTTP_200_OK)

class RemoveCartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):
        with transaction.atomic():
            cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
            variant = cart_item.variant
            
            variant.stock += cart_item.quantity
            variant.save()
            cart_item.delete()

        return Response({'message': 'Item removed and stock returned.'}, status=status.HTTP_204_NO_CONTENT)

class ClearCartView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        with transaction.atomic():
            cart = get_object_or_404(Cart, user=request.user)
            for item in cart.items.all():
                variant = item.variant
                variant.stock += item.quantity
                variant.save()
            cart.items.all().delete()

        return Response({'message': 'Cart cleared and all stock returned.'}, status=status.HTTP_204_NO_CONTENT)