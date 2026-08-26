"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react"; 
// Import the Grid and the Product Interface we just created
import ProductGrid, { Product } from "@/components/ProductGrid";

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
          const safeWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const exactRegex = new RegExp(`\\b${safeWord}\\b`, 'i');

          if (exactRegex.test(specificText)) {
            score += 1;
          } else if (specificText.includes(word)) {
            score += 0.5;
          } else if (globalTags.includes(word)) {
            score += 0.01;
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

    sortedProducts.sort((a, b) => {
      const scoreA = scores.get(a.id) || 0;
      const scoreB = scores.get(b.id) || 0;
      if (scoreB !== scoreA) return scoreB - scoreA; 
      return a.name.localeCompare(b.name); 
    });
    
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