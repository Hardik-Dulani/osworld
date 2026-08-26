from typing import List, Optional
from ninja import Schema

class ProductMediaOut(Schema):
    id: int
    media_url: str
    is_video: bool

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
    gallery: List[ProductMediaOut] = [] 

    @staticmethod
    def resolve_category_name(obj):
        return obj.category.name

    @staticmethod
    def resolve_image_url(obj):
        # Gracefully prefers an uploaded file, but falls back to the string URL
        if obj.image:
            return obj.image.url
        return obj.image_url or ""

class CartItemIn(Schema):
    product_id: int
    quantity: int

class SyncCartSchema(Schema):
    items: List[CartItemIn]
    user_id: Optional[int] = None