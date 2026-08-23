from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    icon = models.CharField(max_length=50, default="Sparkles", help_text="Lucide icon name")

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Product(models.Model):
    AGE_CHOICES = [
        ('0-2', '0-2 Years (Toddlers)'),
        ('3-5', '3-5 Years (Preschool)'),
        ('6-8', '6-8 Years (Early School)'),
        ('9+', '9+ Years (Big Kids)'),
    ]

    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    age_group = models.CharField(max_length=10, choices=AGE_CHOICES, default='3-5')
    badge = models.CharField(max_length=50, blank=True, help_text="e.g., Bestseller, New, 20% OFF")
    image_url = models.URLField(max_length=500, default="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80")
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=4.9)
    stock_quantity = models.IntegerField(default=20)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class CartItem(models.Model):
    # Tied to a User if logged in, otherwise tied to a device session_key
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE)
    session_key = models.CharField(max_length=100, null=True, blank=True)
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # A user/session can only have one row per product (we just update the quantity)
        unique_together = ('user', 'product', 'session_key')

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"