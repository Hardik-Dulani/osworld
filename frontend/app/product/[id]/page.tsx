"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Star, ShoppingBag, Heart, Minus, Plus, ShieldCheck, Sparkles, ArrowRightLeft, Truck, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductGallery from "@/components/ProductGallery";
import ProductGrid from "@/components/ProductGrid";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  
  const [product, setProduct] = useState<any>(null);
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartQty, setCartQty] = useState(0);

  const [reviewForm, setReviewForm] = useState({ author_name: "", rating: 5, comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

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

    fetch(`http://127.0.0.1:8000/api/products`)
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((p: any) => p.id !== parseInt(params.id as string));
        setSuggestedProducts(filtered);
      })
      .catch((err) => console.error("Failed to fetch suggestions", err));
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

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.author_name || !reviewForm.comment) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewForm),
      });
      
      if (res.ok) {
        const newReview = await res.json();
        setProduct({ ...product, reviews: [newReview, ...product.reviews] });
        setReviewForm({ author_name: "", rating: 5, comment: "" });
        setIsReviewFormOpen(false);
      }
    } catch (err) {
      console.error("Failed to submit review", err);
    }
    setIsSubmitting(false);
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
          <ProductGallery product={product} />

          <div className="w-full lg:w-[60%] px-4 sm:px-6 lg:px-0 flex flex-col py-6 lg:py-0">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                {product.category_name}
              </span>
              <div className="flex items-center gap-1.5 text-sm font-extrabold text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span>{product.rating} <span className="text-muted-foreground font-medium">({product.reviews?.length || 0})</span></span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground mt-2 leading-tight">
              {product.name}
            </h1>
            
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl lg:text-4xl font-black text-foreground">
                ₹{product.price.toFixed(0)}
              </span>
              {product.original_price && (
                <span className="text-lg font-bold text-muted-foreground line-through">
                  ₹{product.original_price.toFixed(0)}
                </span>
              )}
            </div>

            {/* TIGHTER SPACING: Reduced mt-8 to mt-4 */}
            <p className="mt-4 text-base text-muted-foreground leading-relaxed lg:pr-12">
              {product.description}
            </p>

            {/* THE NEW COMPACT POLICY ROW */}
            <div className="mt-6 lg:mr-12 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 bg-secondary/10 p-3 sm:p-4 rounded-2xl border border-secondary/20">
                <div className="h-8 w-8 bg-background rounded-full flex shrink-0 items-center justify-center shadow-sm border border-border">
                  <ArrowRightLeft className="h-4 w-4 text-foreground rotate-90" />
                </div>
                <span className="text-xs font-bold leading-snug text-foreground">{product.return_policy}</span>
              </div>
              
              <div className="flex-1 flex items-center gap-3 bg-secondary/10 p-3 sm:p-4 rounded-2xl border border-secondary/20">
                <div className="h-8 w-8 bg-background rounded-full flex shrink-0 items-center justify-center shadow-sm border border-border">
                  <Truck className="h-4 w-4 text-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold leading-snug text-foreground">{product.delivery_info}</span>
                  <span className="text-[10px] font-bold text-muted-foreground mt-0.5">Delivered in {product.delivery_days}</span>
                </div>
              </div>
            </div>

            {/* TIGHTER SPACING: Reduced mt-8 to mt-6 */}
            <div className="mt-6 mb-2 lg:pr-12">
              {cartQty > 0 ? (
                <div className="flex h-14 w-full items-center justify-between rounded-2xl border-2 border-primary bg-primary/5 px-2">
                  <button onClick={() => updateCart(-1)} className="flex h-10 w-12 items-center justify-center rounded-xl hover:bg-primary/20 text-primary transition-colors"><Minus className="h-5 w-5" /></button>
                  <span className="text-lg font-black text-primary select-none">{cartQty} in Cart</span>
                  <button onClick={() => updateCart(1)} className="flex h-10 w-12 items-center justify-center rounded-xl hover:bg-primary/20 text-primary transition-colors"><Plus className="h-5 w-5" /></button>
                </div>
              ) : (
                <Button onClick={() => updateCart(1)} className="h-14 w-full rounded-2xl bg-primary text-base font-black text-primary-foreground hover:bg-primary/90 shadow-md transition-all active:scale-[0.98]">
                  <ShoppingBag className="h-5 w-5 mr-2" /> Add to Cart
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* TIGHTER SPACING: Reduced my-16 to my-8 */}
        <hr className="my-8 lg:my-10 border-border" />

        {/* PRODUCT REVIEWS SECTION */}
        <div className="px-4 sm:px-6 lg:px-0 mb-8 lg:mb-12">
          
          {/* HEADER WITH TOGGLE BUTTON */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-2xl font-black text-foreground">Customer Reviews</h2>
            <Button 
              onClick={() => setIsReviewFormOpen(!isReviewFormOpen)} 
              variant={isReviewFormOpen ? "outline" : "default"}
              className={`rounded-xl font-bold w-full sm:w-auto ${!isReviewFormOpen && "shadow-sm"}`}
            >
              {isReviewFormOpen ? "Cancel" : <><MessageSquarePlus className="h-4 w-4 mr-2" /> Write a Review</>}
            </Button>
          </div>

          {/* SMOOTH ANIMATED ACCORDION FORM */}
          <div 
            className={`grid transition-all duration-500 ease-in-out ${
              isReviewFormOpen ? "grid-rows-[1fr] opacity-100 mb-8" : "grid-rows-[0fr] opacity-0 mb-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="bg-card p-6 lg:p-8 rounded-3xl border border-border shadow-xs max-w-3xl">
                <h3 className="font-extrabold text-lg mb-6">Share your thoughts</h3>
                <form onSubmit={submitReview} className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star className={`h-8 w-8 sm:h-10 sm:w-10 ${reviewForm.rating >= star ? "fill-amber-500 text-amber-500" : "text-muted-foreground opacity-30"}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Your Name</label>
                    <input 
                      type="text" 
                      required
                      value={reviewForm.author_name}
                      onChange={(e) => setReviewForm({ ...reviewForm, author_name: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Your Review</label>
                    <textarea 
                      required
                      rows={4}
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      placeholder="What did you love about this toy?"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isSubmitting} className="rounded-xl font-bold h-11 px-8 w-full sm:w-auto">
                      {isSubmitting ? "Submitting..." : "Post Review"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          
          {/* THE REVIEW GRID */}
          {(!product.reviews || product.reviews.length === 0) ? (
            <div className="p-8 sm:p-12 text-center bg-muted/30 rounded-3xl border border-dashed border-border mt-4">
              <p className="text-muted-foreground font-bold">No reviews yet. Be the first to review this toy!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4">
              {product.reviews.map((review: any) => (
                <div key={review.id} className="p-5 sm:p-6 bg-card rounded-3xl border border-border shadow-xs hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-extrabold text-foreground truncate mr-2">{review.author_name}</span>
                    <div className="flex text-amber-500 shrink-0">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground italic leading-relaxed">"{review.comment}"</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-4">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TIGHTER SPACING: Reduced my-16 to my-8 */}
        <hr className="my-8 lg:my-10 border-border" />

        {/* SEE MORE INFINITE GRID SECTION */}
        <div className="px-4 sm:px-6 lg:px-0">
          <div className="flex items-center gap-2 mb-6 sm:mb-8">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h2 className="text-xl sm:text-2xl font-black text-foreground">You Might Also Like</h2>
          </div>
          
          {suggestedProducts.length > 0 ? (
            <ProductGrid products={suggestedProducts} />
          ) : (
            <p className="text-muted-foreground font-bold text-center py-12">Loading more magic...</p>
          )}
        </div>

      </div>
    </main>
  );
}