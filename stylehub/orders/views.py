from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.db import transaction
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db.models import Sum, F
from django.db.models.functions import TruncMonth
import logging

from .models import Order, OrderItem, ShippingRate
from .serializers import OrderSerializer, ShippingRateSerializer
from cart.models import Cart, CartItem
from products.models import ProductVariant
from .payments import get_auth_token, create_payment_order, get_payment_key

logger = logging.getLogger(__name__)


class CreateOrderView(APIView):
    permission_classes = [AllowAny]  # ✅ guest مسموح

    @transaction.atomic
    def post(self, request):
        # ✅ لو مسجل دخول استخدم الـ user، لو guest استخدم None
        user = request.user if request.user.is_authenticated else None

        # ✅ جلب السلة — للمسجل من DB، للـ guest من الـ session
        if user:
            cart = Cart.objects.filter(user=user).first()
            cart_items_data = list(cart.items.all()) if cart else []
        else:
            # سلة الـ guest من الـ session
            session_cart = request.session.get('cart', {})
            cart_items_data = []
            for variant_id, quantity in session_cart.items():
                try:
                    variant = ProductVariant.objects.get(id=int(variant_id))
                    cart_items_data.append({'variant': variant, 'quantity': quantity})
                except ProductVariant.DoesNotExist:
                    pass

        if not cart_items_data:
            return Response({'error': 'السلة فارغة، لا يمكن إتمام الطلب.'}, status=status.HTTP_400_BAD_REQUEST)

        full_name = request.data.get('full_name')
        phone = request.data.get('phone')
        address = request.data.get('address')
        city = request.data.get('city', 'Cairo')
        payment_method = request.data.get('payment_method', 'cash')
        payment_screenshot = request.FILES.get('payment_screenshot')

        if not all([full_name, phone, address]):
            return Response({'error': 'يرجى إكمال بيانات الشحن (الاسم، الهاتف، العنوان).'}, status=status.HTTP_400_BAD_REQUEST)

        order = Order.objects.create(
            user=user,  # ✅ None للـ guest
            full_name=full_name,
            phone=phone,
            address=address,
            city=city,
            payment_method=payment_method,
            total_amount=0,
            payment_status='unpaid' if payment_method == 'visa' else 'pending',
            payment_screenshot=payment_screenshot
        )

        total = 0

        for item in cart_items_data:
            # item ممكن يكون CartItem object أو dict للـ guest
            if isinstance(item, dict):
                variant = item['variant']
                quantity = item['quantity']
            else:
                variant = item.variant
                quantity = item.quantity

            if quantity > variant.stock:
                transaction.set_rollback(True)
                return Response({
                    'error': f'المخزون غير كافٍ للمنتج {variant.product.name}. المتاح حالياً {variant.stock} فقط.'
                }, status=status.HTTP_400_BAD_REQUEST)

            OrderItem.objects.create(
                order=order,
                variant=variant,
                product_name=variant.product.name,
                size=variant.size.name,
                quantity=quantity,
                price=variant.product.price
            )

            total += variant.product.price * quantity
            variant.stock -= quantity
            variant.save()

        order.total_amount = total
        order.save()

        # ✅ مسح السلة بعد الطلب
        if user and cart:
            cart.items.all().delete()
        else:
            request.session['cart'] = {}
            request.session.modified = True

        # ✅ إرسال إيميل فقط لو مسجل دخول
        if user:
            try:
                send_order_confirmation_email(order)
            except Exception as e:
                logger.error(f"Notification Error: {str(e)}")

        if payment_method == 'visa':
            try:
                auth_token = get_auth_token()
                amount_cents = int(total * 100)
                paymob_order_id = create_payment_order(auth_token, amount_cents)

                billing_data = {
                    "email": user.email if user else "guest@guest.com",
                    "first_name": full_name.split()[0] if full_name else "Guest",
                    "last_name": full_name.split()[-1] if len(full_name.split()) > 1 else "User",
                    "phone_number": phone,
                    "country": "EG",
                    "city": city,
                    "street": address,
                }

                payment_key = get_payment_key(auth_token, paymob_order_id, amount_cents, billing_data)
                iframe_url = f"https://accept.paymob.com/api/acceptance/iframes/{settings.PAYMOB_IFRAME_ID}?payment_token={payment_key}"

                return Response({"id": order.id, "payment_url": iframe_url}, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({
                    "id": order.id,
                    "warning": "فشل إنشاء رابط الدفع",
                    "error_details": str(e)
                }, status=status.HTTP_201_CREATED)

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MyOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by("-created_at")
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
                "building": "NA", "floor": "NA", "apartment": "NA",
            }

            payment_key = get_payment_key(auth_token, paymob_order_id, amount_cents, billing_data)
            iframe_url = f"https://accept.paymob.com/api/acceptance/iframes/{settings.PAYMOB_IFRAME_ID}?payment_token={payment_key}"

            return Response({"payment_url": iframe_url})
        except Exception as e:
            logger.error(f"Paymob error: {str(e)}")
            return Response({"error": "فشل الاتصال بخدمة الدفع"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
def paymob_webhook(request):
    try:
        data = request.POST or request.GET
        if data.get("success") == "true":
            order_id = data.get("merchant_order_id")
            order = Order.objects.filter(id=order_id).first()
            if order:
                order.payment_status = "paid"
                order.transaction_id = data.get("id")
                order.status = "processing"
                order.save()
        return JsonResponse({"status": "ok"})
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        return JsonResponse({"error": "webhook failed"}, status=500)


class ShippingRateListView(generics.ListAPIView):
    queryset = ShippingRate.objects.all()
    serializer_class = ShippingRateSerializer
    permission_classes = []


class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_sales = Order.objects.filter(status="delivered").aggregate(total=Sum("total_amount"))["total"] or 0
        return Response({
            "total_sales": total_sales,
            "total_orders": Order.objects.count(),
            "pending_orders": Order.objects.filter(status="pending").count(),
        })


class AdminOrderListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            orders = Order.objects.all().order_by("-created_at")
            serializer = OrderSerializer(orders, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"AdminOrderList GET error: {str(e)}")
            return Response({"error": "حدث خطأ"}, status=500)

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
            new_status = request.data.get("status")
            if not new_status:
                return Response({"error": "No status provided"}, status=400)
            order.status = new_status
            order.save()
            return Response({"status": "updated"})
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=404)
        except Exception as e:
            logger.error(f"AdminOrderList PATCH error: {str(e)}")
            return Response({"error": "server error"}, status=500)


class AdminTopProductsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        top_products = (
            OrderItem.objects.values("product_name")
            .annotate(total_sold=Sum("quantity"), revenue=Sum(F("quantity") * F("price")))
            .order_by("-total_sold")[:10]
        )
        return Response(top_products)


class AdminSalesChartView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        sales = (
            Order.objects.filter(status="delivered")
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(total_sales=Sum("total_amount"))
            .order_by("month")
        )
        return Response([{"month": s["month"].strftime("%Y-%m"), "total_sales": s["total_sales"]} for s in sales])


from django.core.mail import send_mail
from django.template.loader import render_to_string

def send_order_confirmation_email(order):
    subject = f'تأكيد طلبك من Tres Jolie - أوردر رقم #{order.id}'
    context = {'order': order}
    html_message = render_to_string('emails/order_confirmation.html', context)
    plain_message = f"أهلاً {order.full_name}، تم استلام طلبك بنجاح. الإجمالي: {order.total_amount} ج.م"
    send_mail(
        subject, plain_message,
        'Tres Jolie <your-email@gmail.com>',
        [order.user.email],
        html_message=html_message,
    )
