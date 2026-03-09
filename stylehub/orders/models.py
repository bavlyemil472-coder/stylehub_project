from django.db import models
from django.contrib.auth import get_user_model
from products.models import ProductVariant

User = get_user_model()


class Order(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    ]

    PAYMENT_STATUS_CHOICES = [
        ("unpaid", "Unpaid"),
        ("paid", "Paid"),
        ("failed", "Failed"),
    ]

    PAYMENT_METHOD_CHOICES = [
        ("visa", "Visa"),
        ("cash", "Cash"),
        ("INSTAPAY", "InstaPay"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="orders"
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
        db_index=True
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default="unpaid",
        db_index=True
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default="visa"
    )

    transaction_id = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True
    )

    full_name = models.CharField(
        max_length=255,
        blank=True
    )

    phone = models.CharField(
        max_length=20,
        blank=True,
        default=""
    )

    address = models.TextField(
        max_length=500,
        default="no address"
    )

    city = models.CharField(
        max_length=100,
        default="Cairo",
        db_index=True
    )

    payment_screenshot = models.ImageField(
        upload_to="payments/instapay/%Y/%m/",
        blank=True,
        null=True
    )

    payment_notes = models.TextField(
        blank=True,
        null=True
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["payment_status"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"Order #{self.id} - {self.user.email}"

    @property
    def items_count(self):
        return self.items.count()

    @property
    def is_paid(self):
        return self.payment_status == "paid"


class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items"
    )

    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.PROTECT
    )

    product_name = models.CharField(
        max_length=200,
        default=""
    )

    size = models.CharField(
        max_length=10
    )

    quantity = models.PositiveIntegerField()

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    class Meta:
        indexes = [
            models.Index(fields=["order"]),
        ]

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"

    def get_total_price(self):
        return self.price * self.quantity


class ShippingRate(models.Model):

    city_name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="المحافظة"
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="سعر الشحن"
    )

    class Meta:
        verbose_name = "سعر شحن"
        verbose_name_plural = "أسعار الشحن"
        ordering = ["city_name"]

    def __str__(self):
        return f"{self.city_name} - {self.price} EGP"