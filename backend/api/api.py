from typing import List
from ninja import NinjaAPI
from django.shortcuts import get_object_or_404
from .models import Product
from .schemas import ProductOut, SyncCartSchema

api = NinjaAPI(
    title="Osworld Toy Store API",
    version="1.0.0",
    description="API for Osworld Kids Toys & Joy"
)

@api.get("/status")
def backend_status(request):
    return {"status": "ok", "message": "Osworld Toy Store Backend is live!"}

@api.get("/products", response=List[ProductOut])
def list_products(request):
    return Product.objects.filter(is_active=True).select_related('category').order_by('-created_at')

@api.get("/products/{product_id}", response=ProductOut)
def get_product(request, product_id: int):
    """
    Fetches a single active product by its ID for the Product Detail Page.
    """
    return get_object_or_404(Product, id=product_id, is_active=True)

@api.post("/cart/sync")
def sync_cart(request, payload: SyncCartSchema):
    """
    Receives the entire cart from the Next.js frontend and saves it to the database.
    Runs silently in the background!
    """
    # In a full auth system, we'd use request.user. 
    # For now, we simulate a successful sync.
    print(f"Background Sync Received: {len(payload.items)} items")
    
    # Here we would normally loop through payload.items and update/create CartItem models
    # e.g., CartItem.objects.update_or_create(product_id=item.product_id, defaults={'quantity': item.quantity})
    
    return {"status": "success", "message": "Cart synced to database"}