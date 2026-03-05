from django.db import models
from django.contrib.auth import get_user_model
from products.models import ProductVariant

User = get_user_model()


class Cart(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="cart"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart ({self.user.email})"


class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items'
    )
    variant = models.ForeignKey( 'products.ProductVariant', on_delete=models.CASCADE, related_name='cart_items', null=True, blank=True )
    quantity = models.PositiveIntegerField(default=1)

    def get_total_price(self):
        return self.quantity * self.variant.price

    def __str__(self):
        return f"{self.variant.product.name} ({self.variant.size}) x {self.quantity}"

from django.db.models.signals import post_delete
from django.dispatch import receiver

@receiver(post_delete, sender=CartItem)
def auto_restore_stock(sender, instance, **kwargs):
   
    if hasattr(instance, 'skip_stock_restore') and instance.skip_stock_restore:
        return

    variant = instance.variant
    if variant:
        variant.stock += instance.quantity
        variant.save()