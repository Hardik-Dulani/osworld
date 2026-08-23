from django.contrib import admin
from .models import Category, Product

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'icon']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'age_group', 'badge', 'stock_quantity', 'is_active']
    list_filter = ['is_active', 'category', 'age_group']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}