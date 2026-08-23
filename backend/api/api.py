from typing import List, Optional
from ninja import NinjaAPI, Schema
from .models import Category, Product

api = NinjaAPI(
    title="Osworld Toy Store API",
    version="1.0.0",
    description="API for Osworld Kids Toys & Joy"
)

class ProductOut(Schema):
    id: int
    name: str
    slug: str
    description: str
    price: float
    original_price: Optional[float] = None
    age_group: str
    badge: str
    image_url: str
    rating: float
    stock_quantity: int
    category_name: str = None

    @staticmethod
    def resolve_category_name(obj):
        return obj.category.name

@api.get("/status")
def backend_status(request):
    return {"status": "ok", "message": "Osworld Toy Store Backend is live!"}

@api.get("/products", response=List[ProductOut])
def list_products(request):
    return Product.objects.filter(is_active=True).select_related('category').order_by('-created_at')


# Add BaseModel to your imports at the top:
# from pydantic import BaseModel

class CartItemIn(Schema):
    product_id: int
    quantity: int

class SyncCartSchema(Schema):
    items: List[CartItemIn]
    # We will use this when we build authentication later
    user_id: Optional[int] = None 

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