from typing import List, Optional
import datetime
from ninja import Schema

class ProductMediaOut(Schema):
    id: int
    media_url: str
    is_video: bool

class ReviewOut(Schema):
    id: int
    author_name: str
    rating: int
    comment: str
    created_at: datetime.datetime

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
    
    # Dynamic Policy Fields
    return_policy: str
    delivery_info: str
    delivery_days: str
    
    # Nested Relationships
    gallery: List[ProductMediaOut] = [] 
    reviews: List[ReviewOut] = []

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

class ReviewIn(Schema):
    author_name: str
    rating: int
    comment: str


# --- AUTHENTICATION SCHEMAS ---
class RegisterIn(Schema):
    name: str
    email: str
    password: str

class LoginIn(Schema):
    email: str
    password: str

# --- COUPON SCHEMAS ---
class CouponOut(Schema):
    code: str
    type: str 
    value: float

    @staticmethod
    def resolve_type(obj):
        return obj.discount_type

    @staticmethod
    def resolve_value(obj):
        # Our frontend expects decimals for percentages (e.g. 0.10 for 10%)
        if obj.discount_type == 'percent':
            return obj.discount_value / 100
        return obj.discount_value

# --- CHECKOUT SCHEMAS ---
class CheckoutItemIn(Schema):
    product_id: int
    quantity: int

class CheckoutIn(Schema):
    full_name: str
    email: str
    address: str
    items: List[CheckoutItemIn]
    coupon_code: Optional[str] = None
    user_id: Optional[int] = None

# Add this to the very bottom of schemas.py
class OrderItemOut(Schema):
    product_name: str
    quantity: int
    price_at_time: float
    image_url: str

    @staticmethod
    def resolve_product_name(obj):
        return obj.product.name if obj.product else "Unknown Product"

    @staticmethod
    def resolve_image_url(obj):
        if obj.product:
            return obj.product.image.url if obj.product.image else (obj.product.image_url or "")
        return ""

class OrderOut(Schema):
    id: int
    full_name: str
    email: str
    address: str
    total_amount: float
    status: str
    created_at: datetime.datetime
    items: List[OrderItemOut]

    @staticmethod
    def resolve_items(obj):
        return obj.items.all()