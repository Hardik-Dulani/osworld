"use client";

import Link from "next/link";
import { Plus, Minus, Star, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function ProductGrid({ products }: { products: any[] }) {
  // Grab the global cart context!
  const { cartItems, updateQuantity } = useCart();

  const getCartQty = (productId: number) => {
    const item = cartItems.find(i => i.id === productId);
    return item ? item.quantity : 0;
  };

  const getFullUrl = (url: string) => {
    if (!url) return "";
    return url.startsWith('http') ? url : `http://127.0.0.1:8000${url}`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map(product => {
        const qty = getCartQty(product.id);
        
        return (
          <div key={product.id} className="group flex flex-col bg-card rounded-[2rem] border border-border overflow-hidden shadow-xs hover:shadow-md transition-all p-3">
            
            {/* Image Container with Overlays */}
            <div className="relative aspect-square sm:aspect-[4/3] overflow-hidden rounded-3xl bg-muted mb-4">
              {product.badge && (
                <span className="absolute top-3 left-3 z-10 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-black text-black">
                  {product.badge}
                </span>
              )}
              
              <button className="absolute top-3 right-3 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-white shadow-sm text-foreground/70 hover:text-primary hover:scale-110 transition-all">
                <Heart className="h-4 w-4" />
              </button>

              <div className="absolute bottom-3 left-3 z-10 rounded-full bg-white shadow-sm px-3 py-1 text-[10px] font-black text-black">
                {product.age_group} Yrs
              </div>

              <Link href={`/product/${product.id}`}>
                <img 
                  src={getFullUrl(product.image_url)} 
                  alt={product.name} 
                  className="h-full w-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
                />
              </Link>
            </div>

            {/* Product Details */}
            <div className="flex flex-col flex-1 px-2 pb-2">
              <div className="flex justify-between items-start mb-2 gap-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{product.category_name}</p>
                <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold shrink-0">
                  <Star className="h-3 w-3 fill-current" /> {product.rating}
                </div>
              </div>
              
              <Link href={`/product/${product.id}`}>
                <h3 className="font-extrabold text-foreground text-sm sm:text-base line-clamp-2 hover:text-primary transition-colors mb-4">
                  {product.name}
                </h3>
              </Link>
              
              <div className="mt-auto flex items-center justify-between">
                <span className="font-black text-lg">₹{product.price}</span>
                
                {qty > 0 ? (
                  <div className="flex items-center gap-3 bg-secondary/10 rounded-2xl px-2 py-1 border border-secondary/20">
                    <button 
                      onClick={(e) => { e.preventDefault(); updateQuantity(product, -1); }} 
                      className="h-7 w-7 flex items-center justify-center rounded-xl hover:bg-background text-foreground transition-colors shadow-sm border border-transparent hover:border-border"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="font-bold text-xs w-4 text-center">{qty}</span>
                    <button 
                      onClick={(e) => { e.preventDefault(); updateQuantity(product, 1); }} 
                      className="h-7 w-7 flex items-center justify-center rounded-xl hover:bg-background text-foreground transition-colors shadow-sm border border-transparent hover:border-border"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={(e) => { e.preventDefault(); updateQuantity(product, 1); }} 
                    className="h-9 px-5 rounded-full bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition-opacity"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}