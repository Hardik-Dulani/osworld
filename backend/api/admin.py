from django.contrib import admin
from .models import Category, Product, ProductMedia, Review

# This creates the upload section inside the Product page
class ProductMediaInline(admin.TabularInline):
    model = ProductMedia
    extra = 1

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'stock_quantity', 'is_active')
    list_filter = ('category', 'is_active', 'age_group')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductMediaInline] # Embeds the media gallery

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'author_name', 'rating')

from .models import Category, Product, ProductMedia, Review, Coupon, Order, OrderItem

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_type', 'discount_value', 'is_active')

# This allows you to see the items inside an order from the admin panel!
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'price_at_time')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'total_amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    inlines = [OrderItemInline]