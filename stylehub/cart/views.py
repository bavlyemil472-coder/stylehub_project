from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from django.db import transaction

from .models import Cart, CartItem
from .serializers import CartSerializer
from products.models import ProductVariant


class CartDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            cart, _ = Cart.objects.get_or_create(user=request.user)
            serializer = CartSerializer(cart, context={'request': request})
            return Response(serializer.data)
        else:
            session_cart = request.session.get('cart', {})
            items = []
            total = 0
            for variant_id, quantity in session_cart.items():
                try:
                    variant = ProductVariant.objects.select_related('product', 'size').get(id=int(variant_id))
                    item_total = float(variant.product.price) * quantity
                    total += item_total
                    items.append({
                        'id': variant_id,
                        'variant_id': variant.id,
                        'product_name': variant.product.name,
                        'size': variant.size.name,
                        'price': float(variant.product.price),
                        'quantity': quantity,
                        'total_price': item_total,
                        'image': variant.product.image.url if variant.product.image else '',
                    })
                except ProductVariant.DoesNotExist:
                    pass
            return Response({'items': items, 'total_cart_price': total})


class AddToCartView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        variant_id = request.data.get('variant_id')
        quantity = int(request.data.get('quantity', 1))

        if quantity <= 0:
            return Response({'error': 'Quantity must be greater than zero.'}, status=status.HTTP_400_BAD_REQUEST)

        variant = get_object_or_404(ProductVariant, id=variant_id)

        if variant.stock < quantity:
            return Response({'error': 'Not enough stock available.'}, status=status.HTTP_400_BAD_REQUEST)

        if request.user.is_authenticated:
            with transaction.atomic():
                cart, _ = Cart.objects.get_or_create(user=request.user)
                cart_item, item_created = CartItem.objects.get_or_create(cart=cart, variant=variant)
                if not item_created:
                    cart_item.quantity += quantity
                else:
                    cart_item.quantity = quantity
                variant.stock -= quantity  # ✅ المسجل بيخصم فوراً
                variant.save()
                cart_item.save()
                cart.save()
        else:
            # ✅ Guest — بيحفظ في الـ session بس مش بيخصم من الـ stock
            session_cart = request.session.get('cart', {})
            key = str(variant_id)
            session_cart[key] = session_cart.get(key, 0) + quantity
            request.session['cart'] = session_cart
            request.session.modified = True
            # ❌ مش بنخصم من الـ stock للـ guest هنا

        return Response({'message': 'Product added to cart.'}, status=status.HTTP_201_CREATED)


class UpdateCartItemView(APIView):
    permission_classes = [AllowAny]

    def put(self, request, item_id):
        new_quantity = int(request.data.get('quantity', 0))
        if new_quantity <= 0:
            return Response({'error': 'Quantity must be greater than zero.'}, status=status.HTTP_400_BAD_REQUEST)

        if request.user.is_authenticated:
            with transaction.atomic():
                cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
                variant = cart_item.variant
                diff = new_quantity - cart_item.quantity
                if diff > 0:
                    if variant.stock < diff:
                        return Response({'error': 'Not enough stock.'}, status=status.HTTP_400_BAD_REQUEST)
                    variant.stock -= diff
                elif diff < 0:
                    variant.stock += abs(diff)
                variant.save()
                cart_item.quantity = new_quantity
                cart_item.save()
                cart_item.cart.save()
        else:
            # ✅ Guest — بيعدل في الـ session بس مش بيعدل الـ stock
            session_cart = request.session.get('cart', {})
            key = str(item_id)
            if key in session_cart:
                session_cart[key] = new_quantity
                request.session['cart'] = session_cart
                request.session.modified = True

        return Response({'message': 'Cart updated.'}, status=status.HTTP_200_OK)


class RemoveCartItemView(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, item_id):
        if request.user.is_authenticated:
            with transaction.atomic():
                cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
                variant = cart_item.variant
                variant.stock += cart_item.quantity  # ✅ المسجل بيرجع الـ stock
                variant.save()
                cart_item.delete()
        else:
            # ✅ Guest — بيحذف من الـ session بس مش بيرجع stock
            session_cart = request.session.get('cart', {})
            key = str(item_id)
            if key in session_cart:
                del session_cart[key]
                request.session['cart'] = session_cart
                request.session.modified = True

        return Response({'message': 'Item removed.'}, status=status.HTTP_204_NO_CONTENT)


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
        return Response({'message': 'Cart cleared.'}, status=status.HTTP_204_NO_CONTENT)
