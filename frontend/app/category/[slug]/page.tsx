"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import { Blocks, Gamepad2, Ghost, Box } from "lucide-react";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getCategoryTitle = (slug: string) => {
    if (slug.includes("action")) return "Action & Figures";
    if (slug.includes("wooden")) return "Montessori & Wooden";
    if (slug.includes("plush")) return "Plush & Cuddly";
    return slug.charAt(0).toUpperCase() + slug.slice(1).replace("-", " ");
  };

  const getCategoryIcon = (slug: string) => {
    if (slug.includes("action")) return <Gamepad2 className="h-6 w-6 text-primary" />;
    if (slug.includes("wooden")) return <Blocks className="h-6 w-6 text-primary" />;
    if (slug.includes("plush")) return <Ghost className="h-6 w-6 text-primary" />;
    return <Box className="h-6 w-6 text-primary" />;
  };

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((p: any) => 
          p.category_name.toLowerCase().includes(slug.split("-")[0].toLowerCase())
        );
        setProducts(filtered);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products", err);
        setIsLoading(false);
      });
  }, [slug]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-muted-foreground">Loading toys...</div>;
  }

  return (
    <main className="min-h-screen bg-background pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto lg:pt-12">
      
      {/* SLEEKER HEADER */}
      <div className="flex items-end justify-between mb-8 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            {getCategoryIcon(slug)}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground leading-tight">{getCategoryTitle(slug)}</h1>
            <p className="text-xs font-bold text-muted-foreground mt-1">Discover our collection of {products.length} magical items.</p>
          </div>
        </div>
      </div>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="py-24 text-center bg-muted/30 rounded-[2rem] border border-dashed border-border">
          <p className="text-lg font-bold text-muted-foreground">No toys found in this category right now!</p>
        </div>
      )}
    </main>
  );
}