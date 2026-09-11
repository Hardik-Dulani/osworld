"use client";

import { useEffect, useState } from "react";
import ProductGrid from "@/components/ProductGrid";
import { Baby } from "lucide-react";

export default function AgeGroupsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products", err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-muted-foreground">Sorting toys by age...</div>;
  }

  const getProductsByAge = (ageMatch: string) => {
    return products.filter((p: any) => p.age_group.includes(ageMatch));
  };

  const ageGroups = [
    { title: "Infants & Toddlers", range: "0-2", desc: "Safe, sensory, and soft companions." },
    { title: "Preschoolers", range: "3-5", desc: "Creative building and early learning." },
    { title: "Young Explorers", range: "6-8", desc: "Action, adventure, and puzzles." },
    { title: "Big Kids", range: "9+", desc: "Advanced challenges and collectibles." }
  ];

  return (
    <main className="min-h-screen bg-background pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto lg:pt-12">
      
      {/* SLEEKER HEADER */}
      <div className="flex items-end justify-between mb-10 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <Baby className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground leading-tight">Toys By Age</h1>
            <p className="text-xs font-bold text-muted-foreground mt-1">Find the perfect magic for every stage of development.</p>
          </div>
        </div>
      </div>

      {/* TIGHTER SPACING (Reduced from space-y-24 to space-y-12) */}
      <div className="space-y-12 sm:space-y-16">
        {ageGroups.map((group) => {
          const groupProducts = getProductsByAge(group.range);
          
          if (groupProducts.length === 0) return null;

          return (
            <div key={group.range} className="scroll-mt-24">
              
              {/* COMPACT SECTION HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
                <div className="flex items-center gap-3">
                  <span className="bg-secondary/10 text-secondary border border-secondary/20 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                    {group.range} Yrs
                  </span>
                  <h2 className="text-xl font-black text-foreground leading-none">{group.title}</h2>
                </div>
                <p className="text-xs font-bold text-muted-foreground">{group.desc}</p>
              </div>

              <ProductGrid products={groupProducts} />
            </div>
          );
        })}
      </div>

    </main>
  );
}