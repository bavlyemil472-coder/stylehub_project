from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from rest_framework import generics
from rest_framework.permissions import IsAdminUser
from django.db.models import Sum

from .models import Order, OrderItem , ShippingRate
from .serializers import OrderSerializer , ShippingRateSerializer
from cart.models import Cart, CartItem  
from products.models import ProductVariant, product  
from .payments import (
    get_auth_token,
    create_payment_order,
    get_payment_key
)

class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        user = request.user
        
        cart = Cart.objects.filter(user=user).first()
        if not cart or not cart.items.exists():
            return Response({'error': 'السلة فارغة، لا يمكن إتمام الطلب.'}, status=status.HTTP_400_BAD_REQUEST)

        full_name = request.data.get('full_name')
        phone = request.data.get('phone')
        address = request.data.get('address')
        city = request.data.get('city', 'Cairo')
        payment_method = request.data.get('payment_method', 'cash')

        if not all([full_name, phone, address]):
            return Response({'error': 'يرجى إكمال بيانات الشحن (الاسم، الهاتف، العنوان).'}, status=status.HTTP_400_BAD_REQUEST)

        order = Order.objects.create(
            user=user,
            full_name=full_name,
            phone=phone,
            address=address,
            city=city,
            payment_method=payment_method,
            total_amount=0,
            payment_status='unpaid' if payment_method == 'visa' else 'pending'
        )

        total = 0
        for item in cart.items.all():
            variant = item.variant
            
            if item.quantity > variant.stock:
                transaction.set_rollback(True)
                return Response({'error': f'المخزون غير كافٍ للمنتج {variant.product.name}'}, status=status.HTTP_400_BAD_REQUEST)

            OrderItem.objects.create(
                order=order,
                variant=variant,
                product_name=variant.product.name,
                size=variant.size.name,
                quantity=item.quantity,
                price=variant.product.price
            )

            total += variant.product.price * item.quantity
            
            variant.stock -= item.quantity
            variant.save()

        order.total_amount = total
        order.save()
        cart.items.all().delete()

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class MyOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

class StartPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        order = get_object_or_404(Order, id=order_id, user=request.user)

        amount_cents = int(order.total_amount * 100)

        try:
            auth_token = get_auth_token()
            paymob_order_id = create_payment_order(auth_token, amount_cents)

            billing_data = {
                "email": request.user.email,
                "first_name": order.full_name.split()[0] if order.full_name else request.user.username,
                "last_name": order.full_name.split()[-1] if len(order.full_name.split()) > 1 else "User",
                "phone_number": order.phone,
                "country": "EG",
                "city": order.city,
                "street": order.address,
                "building": "NA",
                "floor": "NA",
                "apartment": "NA"
            }

            payment_key = get_payment_key(
                auth_token,
                paymob_order_id,
                amount_cents,
                billing_data
            )

            iframe_url = f"https://accept.paymob.com/api/acceptance/iframes/{settings.PAYMOB_IFRAME_ID}?payment_token={payment_key}"

            return Response({"payment_url": iframe_url})
        except Exception as e:
            return Response({"error": f"فشل الاتصال بـ Paymob: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
def paymob_webhook(request):
    """هذه الدالة تستقبل إشارة نجاح الدفع من سيرفرات Paymob"""
    data = request.POST or request.GET
    if data.get("success") == "true":
        order_id = data.get("merchant_order_id")

        order = Order.objects.filter(id=order_id).first()
        if order:
            order.payment_status = 'paid'
            order.transaction_id = data.get("id")
            order.status = 'processing'  
            order.save()

    return JsonResponse({"status": "ok"})

class ShippingRateListView(generics.ListAPIView):
    queryset = ShippingRate.objects.all()
    serializer_class = ShippingRateSerializer
    permission_classes = [] 
    
class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminUser] 

    
    def get(self, request):
       
        sales_query = Order.objects.filter(status='delivered').aggregate(total=Sum('total_amount'))
        total_sales = sales_query['total'] or 0

        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status='pending').count()

        return Response({
            "total_sales": total_sales,
            "total_orders": total_orders,
            "pending_orders": pending_orders,
        })

class AdminOrderListView(APIView): 
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            orders = Order.objects.all().order_by('-created_at')
            serializer = OrderSerializer(orders, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error in AdminOrderList GET: {e}")  
            return Response({"error": str(e)}, status=500)

    def patch(self, request, pk): 
        try:
            order = Order.objects.get(pk=pk)
            new_status = request.data.get('status')
            if new_status:
                order.status = new_status
                order.save()
                return Response({"status": "updated"})
            return Response({"error": "No status provided"}, status=400)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
