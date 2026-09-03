from typing import List
from ninja import NinjaAPI
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate
# ADDED: CartItem to the import list
from .models import Product, Review, Coupon, Order, OrderItem, CartItem
from .schemas import (
    ProductOut, SyncCartSchema, ReviewIn, ReviewOut, 
    RegisterIn, LoginIn, CouponOut, CheckoutIn
)

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

# ---------------- CART LOGIC ----------------
@api.post("/cart/sync")
def sync_cart(request, payload: SyncCartSchema):
    """
    Receives the entire cart from the Next.js frontend and saves it to the database.
    Runs silently in the background!
    """
    if not payload.user_id:
        return {"status": "guest_cart_ignored"} # Guests only use localStorage
        
    user = get_object_or_404(User, id=payload.user_id)
    
    # Clear the user's existing DB cart to mirror the fresh frontend state
    CartItem.objects.filter(user=user).delete()
    
    # Save the new state
    for item in payload.items:
        product = get_object_or_404(Product, id=item.product_id)
        CartItem.objects.create(user=user, product=product, quantity=item.quantity)
        
    return {"status": "success", "message": "Cart synced to database"}

@api.get("/cart/{user_id}")
def get_cart(request, user_id: int):
    """
    Retrieves a logged-in user's cart from the database.
    """
    user = get_object_or_404(User, id=user_id)
    cart_items = CartItem.objects.filter(user=user).select_related('product', 'product__category')
    
    # We return the exact dictionary structure the frontend expects
    return [
        {
            "id": item.product.id,
            "name": item.product.name,
            "price": float(item.product.price),
            "image_url": item.product.image.url if item.product.image else (item.product.image_url or ""),
            "category_name": item.product.category.name,
            "quantity": item.quantity
        }
        for item in cart_items
    ]

# ---------------- REVIEWS ----------------
@api.post("/products/{product_id}/reviews", response=ReviewOut)
def create_review(request, product_id: int, payload: ReviewIn):
    """
    Receives a review from the frontend and saves it to the specific product.
    """
    product = get_object_or_404(Product, id=product_id, is_active=True)
    
    # Enforce rating bounds (1 to 5 stars max)
    safe_rating = max(1, min(5, payload.rating))
    
    # Create and save the review to the database
    review = Review.objects.create(
        product=product,
        author_name=payload.author_name,
        rating=safe_rating,
        comment=payload.comment
    )
    
    return review

# ---------------- AUTHENTICATION ----------------
@api.post("/auth/register")
def register(request, payload: RegisterIn):
    if User.objects.filter(username=payload.email).exists():
        return {"error": "Email already exists"}
    
    user = User.objects.create(
        username=payload.email, # Django requires username, so we use email
        email=payload.email,
        password=make_password(payload.password),
        first_name=payload.name
    )
    return {"id": user.id, "name": user.first_name, "email": user.email}

@api.post("/auth/login")
def login(request, payload: LoginIn):
    user = authenticate(username=payload.email, password=payload.password)
    if user:
        return {"id": user.id, "name": user.first_name, "email": user.email}
    return {"error": "Invalid credentials"}


# ---------------- COUPONS & CHECKOUT ----------------
@api.get("/coupons/{code}", response=CouponOut)
def validate_coupon(request, code: str):
    # Returns the coupon if valid, otherwise throws a 404 error
    return get_object_or_404(Coupon, code=code.upper(), is_active=True)

@api.post("/checkout")
def process_checkout(request, payload: CheckoutIn):
    total = 0
    order_items_data = []
    
    # 1. Calculate genuine total from the database (prevents frontend tampering)
    for item in payload.items:
        product = get_object_or_404(Product, id=item.product_id)
        total += float(product.price) * item.quantity
        order_items_data.append({"product": product, "quantity": item.quantity, "price": float(product.price)})
        
    # 2. Apply Coupon if valid
    coupon = None
    if payload.coupon_code:
        try:
            coupon = Coupon.objects.get(code=payload.coupon_code.upper(), is_active=True)
            if coupon.discount_type == 'percent':
                total -= total * (coupon.discount_value / 100)
            else:
                total -= coupon.discount_value
        except Coupon.DoesNotExist:
            pass # Ignore invalid coupons during checkout
            
    # 3. Add Shipping (Free over 2000)
    final_total = max(0, total)
    if final_total < 2000 and final_total > 0:
        final_total += 150
    
    # 4. Create the Order
    user = User.objects.filter(id=payload.user_id).first() if payload.user_id else None
    order = Order.objects.create(
        user=user,
        full_name=payload.full_name,
        email=payload.email,
        address=payload.address,
        total_amount=final_total,
        coupon=coupon
    )
    
    # 5. Save the Items
    for data in order_items_data:
        OrderItem.objects.create(
            order=order, product=data["product"], quantity=data["quantity"], price_at_time=data["price"]
        )
        
    return {"status": "success", "order_id": order.id, "total": final_total}