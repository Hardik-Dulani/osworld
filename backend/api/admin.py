from django.contrib import admin
from .models import Category, Product, ProductMedia

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