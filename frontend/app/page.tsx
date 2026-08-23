"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
// ADDED: Minus and Plus icons
import { Star, ShoppingBag, Sparkles, Heart, Minus, Plus } from "lucide-react"; 
import { Button } from "@/components/ui/button";

interface Product {
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

function ProductGrid({ products }: { products: Product[] }) {
  // Keep track of what's in the cart right on the grid: { productId: quantity }
  const [cartQtys, setCartQtys] = useState<Record<number, number>>({});

  // Load initial quantities from local storage on mount
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("osworld_cart") || "[]");
    const qtys: Record<number, number> = {};
    savedCart.forEach((item: any) => { qtys[item.id] = item.quantity; });
    setCartQtys(qtys);
  }, []);

  // Master function to handle Adding, Removing, and Syncing
  const updateCart = (product: Product, delta: number) => {
    const existingCart = JSON.parse(localStorage.getItem("osworld_cart") || "[]");
    const itemIndex = existingCart.findIndex((item: any) => item.id === product.id);
    
    if (itemIndex >= 0) {
      existingCart[itemIndex].quantity += delta;
      // If it drops to 0, remove it entirely
      if (existingCart[itemIndex].quantity <= 0) {
        existingCart.splice(itemIndex, 1);
      }
    } else if (delta > 0) {
      // New item added
      existingCart.push({ ...product, quantity: 1 });
    }
    
    // 1. Update Frontend Storage (Instant UI)
    localStorage.setItem("osworld_cart", JSON.stringify(existingCart));
    
    // 2. Update Local State (Changes Add button to - 1 +)
    const newQtys = { ...cartQtys };
    if (newQtys[product.id]) {
      newQtys[product.id] += delta;
      if (newQtys[product.id] <= 0) delete newQtys[product.id];
    } else if (delta > 0) {
      newQtys[product.id] = 1;
    }
    setCartQtys(newQtys);
    
    // 3. Update Navbar Number
    window.dispatchEvent(new Event("cartUpdated"));

    // 4. Background Sync to Django Backend!
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
            <img src={toy.image_url} alt={toy.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
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
              <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-2 sm:line-clamp-1 group-hover:text-primary transition-colors">{toy.name}</h3>
            </div>

           {/* Price & Add to Cart */}
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-lg font-black text-foreground">
                      ₹{toy.price.toFixed(0)}
                    </span>

                    {/* DYNAMIC UI: Minimalist, premium pill toggle */}
                    {cartQtys[toy.id] ? (
                      <div className="flex h-8 items-center rounded-full border border-primary/20 bg-primary/5 text-primary shadow-xs">
                        <button 
                          onClick={() => updateCart(toy, -1)} 
                          className="flex h-full w-8 items-center justify-center rounded-l-full hover:bg-primary/10 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold select-none">
                          {cartQtys[toy.id]}
                        </span>
                        <button 
                          onClick={() => updateCart(toy, 1)} 
                          className="flex h-full w-8 items-center justify-center rounded-r-full hover:bg-primary/10 transition-colors"
                          aria-label="Increase quantity"
                        >
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

function Storefront() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";
  
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setAllProducts(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch", err);
        setIsLoading(false);
      });
  }, []);

  let sortedProducts = [...allProducts];
  let bestMatchCount = allProducts.length;

  if (searchQuery) {
    const searchWords = searchQuery.split(" ").filter(word => word.trim() !== "");
    const fillers = ["for", "a", "the", "yo", "year", "years", "old", "age", "my", "with"];
    const meaningfulWords = searchWords.filter(word => !fillers.includes(word));
    
    const scores = new Map<number, number>();

    allProducts.forEach((toy) => {
      const ageKeywords: Record<string, string> = {
        "0-2": "0 1 2 zero one two baby toddler newborn months",
        "3-5": "3 4 5 three four five preschool",
        "6-8": "6 7 8 six seven eight kid children",
        "9+": "9 10 11 12 13 14 15 nine ten eleven twelve teen older big",
      };

      const hiddenTags = ageKeywords[toy.age_group] || "";
      const globalTags = "toy toys game games"; 
      
      const specificText = `${toy.name} ${toy.description} ${toy.category_name} ${toy.age_group} ${hiddenTags}`.toLowerCase();
      
      let score = 0;
      
      if (meaningfulWords.length > 0) {
        meaningfulWords.forEach(word => {
          // Escape the word and check for EXACT word boundaries (e.g. "4" won't match "14")
          const safeWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const exactRegex = new RegExp(`\\b${safeWord}\\b`, 'i');

          if (exactRegex.test(specificText)) {
            score += 1;   // 1 Point for an EXACT word match
          } else if (specificText.includes(word)) {
            score += 0.5; // 0.5 Points for a partial match (e.g. "robo" matching "robotics" or "4" matching "14")
          } else if (globalTags.includes(word)) {
            score += 0.01; // Tiny fraction for matching generic "toys"
          }
        });
      } else if (searchWords.length > 0) {
        const safeQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const exactRegex = new RegExp(`\\b${safeQuery}\\b`, 'i');

        if (exactRegex.test(specificText)) score += 1;
        else if (specificText.includes(searchQuery)) score += 0.5;
        else if (globalTags.includes(searchQuery)) score += 0.01;
      }

      scores.set(toy.id, score);
    });

    // 1. Sort by score
    // 2. Alphabetical tie-breaker
    sortedProducts.sort((a, b) => {
      const scoreA = scores.get(a.id) || 0;
      const scoreB = scores.get(b.id) || 0;
      
      if (scoreB !== scoreA) {
        return scoreB - scoreA; 
      }
      return a.name.localeCompare(b.name); 
    });
    
    // Count matches that scored 0.5 or higher (meaning they actually matched something specific)
    bestMatchCount = sortedProducts.filter(toy => (scores.get(toy.id) || 0) >= 0.5).length;
  }

  return (
    <main className="min-h-screen bg-background pb-16">
      <section className="relative overflow-hidden bg-card border-b border-border py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary/20 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-secondary">
            <Sparkles className="h-4 w-4" /> Discover Magic & Imagination
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground">
            Toys Made for <span className="text-primary">Endless Smiles</span>
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-8 sm:pt-14">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-foreground">
              {searchQuery ? `Search: "${searchQuery}"` : "Featured Toys"}
            </h2>
          </div>
          <span className="hidden sm:inline-block text-xs sm:text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-xl">
            {searchQuery ? `${bestMatchCount} Best Matches` : `${allProducts.length} Items Available`}
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground font-medium">Loading toys...</div>
        ) : (
          <ProductGrid products={[...sortedProducts]} />
        )}
      </section>
    </main>
  );
}
export default function Home() {
  return (
    <Suspense fallback={<div className="p-24 text-center">Loading Store...</div>}>
      <Storefront />
    </Suspense>
  );
}