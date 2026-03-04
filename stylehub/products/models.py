from django.db import models
from django.conf import settings 




class category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='category_images/', null=True, blank=True)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name

class product(models.Model):
    category = models.ForeignKey(category,
     on_delete=models.CASCADE,
      related_name='products'
      )
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_available = models.BooleanField(default=True)
    parent_product = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='color_variants'
    )
    color_name = models.CharField(max_length=50, default="Navy Blue") 
    color_hex = models.CharField(max_length=7 , default="000080#")   
    
    def __str__(self):
        return self.name


class ProductImage(models.Model):
    product = models.ForeignKey(
        product, 
        related_name='p_images', 
        on_delete=models.CASCADE
    )
    image = models.ImageField(upload_to='products/gallery/')
    
    def __str__(self):
        return f"Image for {self.product.name}"
# -----------------------------------

class Size(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class ProductVariant(models.Model):
    product = models.ForeignKey(
        product,
        related_name='variants',
        on_delete=models.CASCADE
    )
    size = models.ForeignKey(
        Size,
        on_delete=models.CASCADE
    )
    stock = models.PositiveIntegerField()

    class Meta:
        unique_together = ('product', 'size')

    def __str__(self):
        return f"{self.product.name} - {self.size.name}"

class Review(models.Model):
    product = models.ForeignKey(product, on_delete=models.CASCADE, related_name='reviews')
    
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE
    )
    
    rating = models.PositiveSmallIntegerField(default=5)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        
        return f"{self.user} - {self.product.name} ({self.rating})"
