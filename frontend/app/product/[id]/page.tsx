"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Star, ShoppingBag, Heart, Minus, Plus, Truck, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// IMPORT THE NEW COMPONENT
import ProductGallery from "@/components/ProductGallery";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cartQty, setCartQty] = useState(0);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/products/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [params.id]);

  useEffect(() => {
    if (!product) return;
    const savedCart = JSON.parse(localStorage.getItem("osworld_cart") || "[]");
    const existingItem = savedCart.find((item: any) => item.id === product.id);
    if (existingItem) setCartQty(existingItem.quantity);
  }, [product]);

  const updateCart = (delta: number) => {
    if (!product) return;
    const existingCart = JSON.parse(localStorage.getItem("osworld_cart") || "[]");
    const itemIndex = existingCart.findIndex((item: any) => item.id === product.id);
    if (itemIndex >= 0) {
      existingCart[itemIndex].quantity += delta;
      if (existingCart[itemIndex].quantity <= 0) existingCart.splice(itemIndex, 1);
    } else if (delta > 0) {
      existingCart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("osworld_cart", JSON.stringify(existingCart));
    setCartQty((prev) => Math.max(0, prev + delta));
    window.dispatchEvent(new Event("cartUpdated"));

    fetch("http://127.0.0.1:8000/api/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: existingCart.map((i: any) => ({ product_id: i.id, quantity: i.quantity })) })
    }).catch(err => console.error("Sync failed:", err));
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-muted-foreground">Loading magic...</div>;
  if (!product) return <div className="min-h-screen flex flex-col items-center justify-center space-y-4"><h1 className="text-2xl font-black">Toy Not Found</h1><Button onClick={() => router.push('/')} variant="outline" className="rounded-xl">Go Back Home</Button></div>;

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-4 h-14 flex items-center justify-between lg:hidden">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border shadow-xs hover:bg-muted transition-colors"><ArrowLeft className="h-5 w-5" /></button>
        <span className="font-extrabold text-sm uppercase tracking-widest text-muted-foreground">Details</span>
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border shadow-xs text-foreground/70 hover:text-primary transition-colors"><Heart className="h-4 w-4" /></button>
      </div>

      <div className="mx-auto max-w-7xl lg:px-8 lg:pt-12">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
          
          {/* THE ENTIRE GALLERY COMPONENT (Shrunk to 40% Width) */}
          <ProductGallery product={product} />

          {/* DETAILS COLUMN (Expanded to 60% Width) */}
          <div className="w-full lg:w-[60%] px-4 sm:px-6 lg:px-0 flex flex-col py-6 lg:py-0">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                {product.category_name}
              </span>
              <div className="flex items-center gap-1.5 text-sm font-extrabold text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span>{product.rating}</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground mt-2 leading-tight">
              {product.name}
            </h1>
            
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl lg:text-4xl font-black text-foreground">
                ₹{product.price.toFixed(0)}
              </span>
              {product.original_price && (
                <span className="text-lg font-bold text-muted-foreground line-through">
                  ₹{product.original_price.toFixed(0)}
                </span>
              )}
            </div>

            <p className="mt-6 text-base text-muted-foreground leading-relaxed lg:pr-12">
              {product.description}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 border-y border-border py-6 lg:mr-12">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Perfect For</p>
                  <p className="text-sm font-extrabold text-foreground">{product.age_group} Years</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Safety</p>
                  <p className="text-sm font-extrabold text-foreground">Non-Toxic</p>
                </div>
              </div>
            </div>

            <div className="mt-8 mb-4 lg:pr-12">
              {cartQty > 0 ? (
                <div className="flex h-14 w-full items-center justify-between rounded-2xl border-2 border-primary bg-primary/5 px-2">
                  <button onClick={() => updateCart(-1)} className="flex h-10 w-12 items-center justify-center rounded-xl hover:bg-primary/20 text-primary transition-colors">
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="text-lg font-black text-primary select-none">
                    {cartQty} in Cart
                  </span>
                  <button onClick={() => updateCart(1)} className="flex h-10 w-12 items-center justify-center rounded-xl hover:bg-primary/20 text-primary transition-colors">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <Button 
                  onClick={() => updateCart(1)}
                  className="h-14 w-full rounded-2xl bg-primary text-base font-black text-primary-foreground hover:bg-primary/90 shadow-md transition-all active:scale-[0.98]"
                >
                  <ShoppingBag className="h-5 w-5 mr-2" /> Add to Cart
                </Button>
              )}
            </div>

            <div className="flex items-center gap-6 mt-4 text-xs font-bold text-muted-foreground lg:pr-12">
              <span className="flex items-center gap-1.5"><Truck className="h-4 w-4" /> Free Shipping</span>
              <span className="flex items-center gap-1.5"><ArrowLeft className="h-4 w-4" /> 7-Day Returns</span>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}