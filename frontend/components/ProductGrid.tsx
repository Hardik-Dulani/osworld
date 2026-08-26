"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, ShoppingBag, Heart, Minus, Plus } from "lucide-react"; 
import { Button } from "@/components/ui/button";

// Exporting the interface so page.tsx can import it!
export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number;
  age_group: string;
  badge: string;
  image_url: string;
  rating: number;
  category_name: string;
}

export default function ProductGrid({ products }: { products: Product[] }) {
  const [cartQtys, setCartQtys] = useState<Record<number, number>>({});

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("osworld_cart") || "[]");
    const qtys: Record<number, number> = {};
    savedCart.forEach((item: any) => { qtys[item.id] = item.quantity; });
    setCartQtys(qtys);
  }, []);

  const updateCart = (product: Product, delta: number) => {
    const existingCart = JSON.parse(localStorage.getItem("osworld_cart") || "[]");
    const itemIndex = existingCart.findIndex((item: any) => item.id === product.id);
    
    if (itemIndex >= 0) {
      existingCart[itemIndex].quantity += delta;
      if (existingCart[itemIndex].quantity <= 0) {
        existingCart.splice(itemIndex, 1);
      }
    } else if (delta > 0) {
      existingCart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem("osworld_cart", JSON.stringify(existingCart));
    
    const newQtys = { ...cartQtys };
    if (newQtys[product.id]) {
      newQtys[product.id] += delta;
      if (newQtys[product.id] <= 0) delete newQtys[product.id];
    } else if (delta > 0) {
      newQtys[product.id] = 1;
    }
    setCartQtys(newQtys);
    
    window.dispatchEvent(new Event("cartUpdated"));

    fetch("http://127.0.0.1:8000/api/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: existingCart.map((i: any) => ({ product_id: i.id, quantity: i.quantity }))
      })
    }).catch(err => console.error("Backend sync failed:", err));
  };

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
        <p className="text-muted-foreground font-medium">No toys matched your search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
      {products.map((toy) => (
        <div key={toy.id} className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          
          <div className="relative aspect-square w-full overflow-hidden bg-muted">
            {/* Wrapped Image in a Link */}
            <Link href={`/product/${toy.id}`}>
              <img src={toy.image_url} alt={toy.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer" />
            </Link>
            {toy.badge && <span className="absolute top-2 left-2 sm:top-3 sm:left-3 rounded-lg sm:rounded-xl bg-accent px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[11px] font-black text-accent-foreground shadow-xs">{toy.badge}</span>}
            <span className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 rounded-md sm:rounded-lg bg-card/90 backdrop-blur-xs px-2 py-0.5 text-[9px] sm:text-[11px] font-extrabold text-foreground border border-border">{toy.age_group} Yrs</span>
            <button className="absolute top-2 right-2 sm:top-3 sm:right-3 flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-card/90 backdrop-blur-xs text-foreground/70 transition-colors hover:text-primary hover:bg-card shadow-xs"><Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></button>
          </div>

          <div className="flex flex-1 flex-col p-3 sm:p-5 justify-between">
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground truncate max-w-[70%]">{toy.category_name}</span>
                <div className="flex items-center gap-0.5 text-[10px] sm:text-xs font-extrabold text-amber-500"><Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" /><span>{toy.rating}</span></div>
              </div>
              {/* Wrapped Title in a Link */}
              <Link href={`/product/${toy.id}`}>
                <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-2 sm:line-clamp-1 group-hover:text-primary transition-colors cursor-pointer">
                  {toy.name}
                </h3>
              </Link>
            </div>

            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-lg font-black text-foreground">
                ₹{toy.price.toFixed(0)}
              </span>

              {cartQtys[toy.id] ? (
                <div className="flex h-8 items-center rounded-full border border-primary/20 bg-primary/5 text-primary shadow-xs">
                  <button onClick={() => updateCart(toy, -1)} className="flex h-full w-8 items-center justify-center rounded-l-full hover:bg-primary/10 transition-colors">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-5 text-center text-xs font-bold select-none">{cartQtys[toy.id]}</span>
                  <button onClick={() => updateCart(toy, 1)} className="flex h-full w-8 items-center justify-center rounded-r-full hover:bg-primary/10 transition-colors">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <Button 
                  onClick={() => updateCart(toy, 1)}
                  size="sm"
                  className="h-8 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground hover:bg-primary/90 shadow-xs transition-all"
                >
                  Add
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}