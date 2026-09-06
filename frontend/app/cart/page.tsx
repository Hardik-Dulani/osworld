"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft, ShieldCheck, Sparkles, Tag, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductGrid from "@/components/ProductGrid";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const router = useRouter();
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const { cartItems, updateQuantity, removeItem, clearCart } = useCart(); 
  const { user } = useAuth();

  const [couponCode, setCouponCode] = useState("");
  const [activeCoupon, setActiveCoupon] = useState<{ code: string; type: string; value: number } | null>(null);
  const [couponMessage, setCouponMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    full_name: "",
    email: "",
    address: ""
  });
  
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    if (user) {
      setCheckoutForm(prev => ({ ...prev, full_name: user.name, email: user.email }));
    }
  }, [user]);

  useEffect(() => {
    setIsMounted(true);
    fetch(`http://127.0.0.1:8000/api/products`)
      .then((res) => res.json())
      .then((data) => setSuggestedProducts(data))
      .catch((err) => console.error("Failed to fetch suggestions", err));
      
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("checkout") === "true") {
        setIsCheckoutOpen(true);
      }
    }
  }, []);

  const cartIds = cartItems.map((item: any) => item.id);
  const displaySuggestions = suggestedProducts.filter((p: any) => !cartIds.includes(p.id));

  const getFullUrl = (url: string) => {
    if (!url) return "";
    return url.startsWith('http') ? url : `http://127.0.0.1:8000${url}`;
  };

  const handleApplyCoupon = async () => {
    const code = couponCode.toUpperCase().trim();
    if (!code) return;
    setIsApplyingCoupon(true);
    setCouponMessage(null);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/coupons/${code}`);
      if (res.ok) {
        const data = await res.json();
        setActiveCoupon(data);
        const discountText = data.type === 'percent' ? `${data.value * 100}%` : `₹${data.value}`;
        setCouponMessage({ text: `${discountText} off applied successfully!`, type: "success" });
      } else {
        setActiveCoupon(null);
        setCouponMessage({ text: "Invalid or expired coupon code.", type: "error" });
      }
    } catch (err) {
      setActiveCoupon(null);
      setCouponMessage({ text: "Error verifying coupon. Please try again.", type: "error" });
    }
    setIsApplyingCoupon(false);
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      router.push("/auth?checkout=true");
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const submitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText.toUpperCase() !== "CONFIRM") return;
    
    setIsProcessingOrder(true);

    const payload = {
      ...checkoutForm,
      items: cartItems.map(i => ({ product_id: i.id, quantity: i.quantity })),
      coupon_code: activeCoupon?.code || null,
      user_id: user?.id || null
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        clearCart(); 
        router.push(`/order/${data.order_id}`);
      }
    } catch (err) {
      console.error("Checkout failed", err);
      setIsProcessingOrder(false);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = activeCoupon 
    ? (activeCoupon.type === "percent" ? subtotal * activeCoupon.value : activeCoupon.value) 
    : 0;
  
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const shipping = subtotalAfterDiscount > 2000 || subtotalAfterDiscount === 0 ? 0 : 150;
  const total = subtotalAfterDiscount + shipping;

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-background pb-24 lg:pt-12 relative">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-4 h-14 flex items-center justify-between lg:hidden mb-6">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border shadow-xs hover:bg-muted transition-colors"><ArrowLeft className="h-5 w-5" /></button>
        <span className="font-extrabold text-sm uppercase tracking-widest text-muted-foreground">Your Cart</span>
        <div className="w-9"></div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 lg:py-24 border-b border-border mb-12">
            <div className="h-24 w-24 bg-secondary/20 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="h-12 w-12 text-secondary" />
            </div>
            <h1 className="text-3xl font-black text-foreground mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8 text-center">Looks like you haven't added any magic to your cart yet!</p>
            <Button onClick={() => router.push('/')} className="rounded-xl h-12 px-8 font-bold text-base">
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            <h1 className="hidden lg:block text-4xl font-black text-foreground mb-10">Your Cart</h1>
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 border-b border-border pb-16 mb-12">
              
              <div className="flex-1 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-card rounded-3xl border border-border shadow-xs">
                    <div className="h-24 w-24 sm:h-32 sm:w-32 shrink-0 bg-muted rounded-2xl overflow-hidden border border-border/50">
                      <img 
                        src={getFullUrl(item.image_url)} 
                        alt={item.name} 
                        className="h-full w-full object-cover mix-blend-multiply"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between py-1">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="font-extrabold text-foreground text-sm sm:text-base line-clamp-2">{item.name}</h3>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{item.category_name}</p>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="font-black text-lg sm:text-xl">₹{item.price.toFixed(0)}</span>
                        <div className="flex items-center gap-3 bg-secondary/10 rounded-xl px-2 py-1 border border-secondary/20">
                          <button 
                            onClick={() => updateQuantity(item, -1)}
                            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-background transition-colors text-foreground"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item, 1)}
                            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-background transition-colors text-foreground"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-full lg:w-[380px] shrink-0">
                <div className="bg-muted/30 p-6 sm:p-8 rounded-3xl border border-border sticky top-24">
                  <h2 className="text-xl font-black mb-6">Order Summary</h2>
                  
                  <div className="mb-6">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5" /> Promo Code
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="e.g. OSWORLD10"
                        className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 uppercase"
                      />
                      <Button 
                        onClick={handleApplyCoupon} 
                        disabled={isApplyingCoupon || !couponCode.trim()}
                        className="rounded-xl font-bold bg-foreground text-background hover:bg-foreground/80 transition-colors"
                      >
                        {isApplyingCoupon ? "..." : "Apply"}
                      </Button>
                    </div>
                    {couponMessage && (
                      <p className={`text-xs font-bold mt-2 ${couponMessage.type === "success" ? "text-green-500" : "text-destructive"}`}>
                        {couponMessage.text}
                      </p>
                    )}
                  </div>

                  <hr className="border-border my-6" />

                  <div className="space-y-4 text-sm font-medium text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-foreground font-bold">₹{subtotal.toFixed(0)}</span>
                    </div>
                    
                    {activeCoupon && (
                      <div className="flex justify-between text-green-500">
                        <span>Discount ({activeCoupon.code})</span>
                        <span className="font-bold">-₹{discountAmount.toFixed(0)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Shipping</span>
                      {shipping === 0 ? (
                        <span className="text-primary font-bold uppercase tracking-wider text-xs bg-primary/10 px-2 py-1 rounded-md">Free</span>
                      ) : (
                        <span className="text-foreground font-bold">₹{shipping.toFixed(0)}</span>
                      )}
                    </div>
                    
                    <hr className="border-border my-4" />
                    
                    <div className="flex justify-between items-end">
                      <span className="text-base text-foreground font-bold">Total</span>
                      <span className="text-3xl font-black text-foreground">₹{total.toFixed(0)}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleProceedToCheckout}
                    className="w-full h-14 rounded-2xl text-base font-black mt-8 shadow-md"
                  >
                    Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <p className="text-center text-xs font-bold text-muted-foreground mt-4 flex items-center justify-center gap-1">
                    <ShieldCheck className="h-4 w-4" /> Secure SSL Checkout
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="mt-8">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-black text-foreground">Explore More Magic</h2>
          </div>
          
          {displaySuggestions.length > 0 ? (
            <ProductGrid products={displaySuggestions} />
          ) : (
            <p className="text-muted-foreground font-bold text-center py-12">Loading more magic...</p>
          )}
        </div>
      </div>

      {/* 40/60 SPLIT CHECKOUT MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card w-full max-w-4xl rounded-[2rem] border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8 flex flex-col">
            
            {/* HEADER */}
            <div className="flex justify-between items-center p-6 border-b border-border bg-muted/30 shrink-0">
              <h2 className="font-black text-xl">Finalize Order</h2>
              <button onClick={() => setIsCheckoutOpen(false)} className="h-8 w-8 flex items-center justify-center rounded-full bg-background border border-border hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* BODY: SPLIT LAYOUT */}
            <form onSubmit={submitCheckout} className="flex flex-col md:flex-row">
              
              {/* LEFT HALF (40%): QR CODE */}
              <div className="w-full md:w-[40%] p-8 bg-muted/10 border-b md:border-b-0 md:border-r border-border flex flex-col items-center justify-center text-center">
                <div className="bg-white p-4 rounded-3xl border border-border shadow-sm mb-6 w-full max-w-[240px] aspect-square flex items-center justify-center">
                  <img 
                    src="/payment-qr.jpeg" 
                    alt="Store UPI QR Code" 
                    className="w-full h-full object-contain" 
                  />
                </div>
                <h3 className="font-black text-lg text-foreground mb-1">Scan to Pay (UPI)</h3>
                <p className="text-sm font-bold text-muted-foreground mb-6">Please complete the payment via any UPI app to proceed.</p>
                <div className="bg-primary/10 text-primary px-6 py-3 rounded-2xl font-black text-2xl border border-primary/20">
                  ₹{total.toFixed(0)}
                </div>
              </div>

              {/* RIGHT HALF (60%): FORM & CONFIRMATION */}
              <div className="w-full md:w-[60%] p-6 sm:p-8 flex flex-col">
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Full Name</label>
                      <input 
                        type="text" required
                        value={checkoutForm.full_name}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, full_name: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Email</label>
                      <input 
                        type="email" required
                        value={checkoutForm.email}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="hello@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Shipping Address</label>
                    <textarea 
                      required rows={3} 
                      value={checkoutForm.address}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      placeholder="123 Toy Lane, Playville..."
                    />
                  </div>

                  <div className="pt-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Verify Payment</label>
                    <input 
                      type="text" required
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 uppercase"
                      placeholder='Type "CONFIRM" after paying'
                    />
                  </div>
                </div>

                {/* FOOTER PUSHED TO BOTTOM */}
                <div className="pt-6 mt-6 sm:mt-10 border-t border-border flex justify-between items-center">
                  <span className="font-bold text-muted-foreground">Total: <span className="text-foreground text-xl sm:text-2xl font-black ml-1">₹{total.toFixed(0)}</span></span>
                  
                  <Button 
                    type="submit" 
                    disabled={isProcessingOrder || confirmText.toUpperCase() !== "CONFIRM"} 
                    className="rounded-xl h-12 px-8 font-bold"
                  >
                    {isProcessingOrder ? "Processing..." : "Pay Now"}
                  </Button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
    </main>
  );
}