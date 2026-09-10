"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Package, Truck, XCircle, Clock, RefreshCcw, Loader, Star, MessageSquarePlus, ImagePlus, X, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import Dropdown from "@/components/ui/Dropdown";

const STEPS = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered"];

const cancelOptions = [
  { label: "Ordered by mistake", value: "Ordered by mistake" },
  { label: "Found a better price", value: "Found a better price" },
  { label: "Delivery time too long", value: "Delivery time too long" },
  { label: "Other", value: "Other" },
];

const returnOptions = [
  { label: "Item damaged or defective", value: "Item damaged or defective" },
  { label: "Wrong item delivered", value: "Wrong item delivered" },
  { label: "Missing parts", value: "Missing parts" },
  { label: "Quality not as expected", value: "Quality not as expected" },
];

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"Cancel" | "Return" | null>(null);
  const [modalReason, setModalReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<FileList | null>(null);

  // Review States
  const [reviewProduct, setReviewProduct] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchOrder = () => {
    if (!user) return;
    
    fetch(`http://127.0.0.1:8000/api/orders/${params.id}?user_id=${user.id}`)
      .then((res) => { if (!res.ok) throw new Error("Not found or Unauthorized"); return res.json(); })
      .then((data) => { setOrder(data); setIsLoading(false); })
      .catch(() => { setIsLoading(false); });
  };

  useEffect(() => { 
    if (isAuthLoading) return;
    
    if (!user) {
      router.push("/");
      return;
    }
    
    fetchOrder(); 
  }, [params.id, user, isAuthLoading, router]);

  const getFullUrl = (url: string) => url ? (url.startsWith('http') ? url : `http://127.0.0.1:8000${url}`) : "";

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalReason || !user) return alert("Please select a reason.");
    setActionLoading(true);

    const newStatus = modalType === "Cancel" ? "Cancelled" : "Returned";

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/orders/${order.id}/status?user_id=${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, reason: modalReason })
      });
      if (res.ok) {
        setModalOpen(false);
        setModalReason("");
        fetchOrder();
      }
    } catch (err) {
      console.error("Update failed", err);
    }
    setActionLoading(false);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.comment || !reviewProduct || !user) return;
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/products/${reviewProduct.product_id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author_name: user.name, rating: reviewForm.rating, comment: reviewForm.comment }),
      });
      if (res.ok) {
        setReviewProduct(null);
        setReviewForm({ rating: 5, comment: "" });
      }
    } catch (err) {
      console.error("Failed to submit review", err);
    }
    setIsSubmittingReview(false);
  };

  if (isAuthLoading || isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-muted-foreground">Fetching Details...</div>;
  if (!order) return <div className="min-h-screen flex flex-col items-center justify-center space-y-4"><h1 className="text-2xl font-black">Order Not Found</h1></div>;

  const currentStepIndex = STEPS.indexOf(order.status);
  const isCancelled = order.status === "Cancelled";
  const isReturned = order.status === "Returned";
  const isDelivered = order.status === "Delivered";
  
  const createdDate = new Date(order.created_at);
  let expectedDate = order.expected_delivery_date 
    ? new Date(order.expected_delivery_date) 
    : new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    
  const now = new Date();
  now.setHours(0,0,0,0);
  const expCopy = new Date(expectedDate);
  expCopy.setHours(0,0,0,0);

  if (expCopy.getTime() < now.getTime() && !["Delivered", "Cancelled", "Returned"].includes(order.status)) {
    expectedDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  }

  const returnWindowDate = new Date(expectedDate.getTime() + 3 * 24 * 60 * 60 * 1000);
  const isReturnEligible = new Date() <= returnWindowDate;

  return (
    <main className="min-h-screen bg-background pb-24 lg:pt-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <button onClick={() => router.push('/orders')} className="mb-6 flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to My Orders
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 border-b border-border pb-6 gap-4">
          <div>
            <h1 className="text-2xl font-black text-foreground">Order #{order.id}</h1>
            <p className="text-xs font-bold text-muted-foreground mt-1">Placed on {createdDate.toLocaleDateString()}</p>
          </div>
          
          {!isCancelled && !isReturned && currentStepIndex < 4 && (
            <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl border border-primary/20">
              <CalendarClock className="h-5 w-5" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider leading-none">Expected Arrival</span>
                <span className="text-sm font-black leading-tight">{expectedDate.toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Items & Details */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-xs">
              <h2 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground mb-4">Items</h2>
              <div className="space-y-6">
                {order.items.map((item: any, idx: number) => {
                  const itemTotal = item.quantity * item.price_at_time;
                  return (
                    <div key={idx} className="flex gap-4 items-center border-b border-border/50 pb-6 last:border-0 last:pb-0">
                      
                      <Link href={`/product/${item.product_id}`} className="h-16 w-16 shrink-0 bg-muted rounded-xl overflow-hidden border border-border/50 hover:opacity-80 transition-opacity">
                        <img src={getFullUrl(item.image_url)} alt="toy" className="h-full w-full object-cover mix-blend-multiply" />
                      </Link>
                      
                      <div className="flex-1 w-full">
                        <div className="flex justify-between items-start">
                          <div>
                            <Link href={`/product/${item.product_id}`} className="hover:text-primary transition-colors">
                              <h3 className="font-extrabold text-sm line-clamp-1">{item.product_name}</h3>
                            </Link>
                            <p className="text-xs font-bold text-muted-foreground mt-0.5">
                              Qty: {item.quantity} &times; ₹{item.price_at_time.toFixed(0)}
                            </p>
                          </div>
                          <span className="font-black text-foreground text-sm">₹{itemTotal.toFixed(0)}</span>
                        </div>

                        {order.status === "Delivered" && item.product_id > 0 && (
                          <Button onClick={() => setReviewProduct(item)} variant="secondary" size="sm" className="mt-3 rounded-xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 border-0 h-8">
                            <MessageSquarePlus className="mr-1.5 h-3.5 w-3.5" /> Rate & Review
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-border flex justify-between items-end">
                <span className="font-bold text-muted-foreground uppercase tracking-wider text-xs">Grand Total</span>
                <span className="text-3xl font-black text-primary">₹{order.total_amount.toFixed(0)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-3xl border border-border shadow-xs">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Shipping Details</h3>
                <p className="text-sm font-bold text-foreground leading-relaxed">
                  {order.full_name}<br/>
                  <span className="text-muted-foreground font-medium">{order.email}</span><br/>
                  {order.address}
                </p>
              </div>

              <div className="bg-card p-6 rounded-3xl border border-border shadow-xs flex flex-col justify-center">
                {!isCancelled && !isReturned && (
                  <>
                    {currentStepIndex < 3 ? (
                      <div>
                        <p className="text-xs font-bold text-muted-foreground mb-3 text-center">Changed your mind?</p>
                        <Button onClick={() => { setModalType("Cancel"); setModalOpen(true); }} variant="outline" className="w-full rounded-xl font-bold border-red-500/30 text-red-500 hover:bg-red-500/10">
                          Cancel Order
                        </Button>
                      </div>
                    ) : order.status === "Delivered" ? (
                      <div className="text-center">
                        <p className={`text-xs font-bold mb-3 ${isReturnEligible ? "text-muted-foreground" : "text-red-500"}`}>
                          {isReturnEligible ? `Return available until ${returnWindowDate.toLocaleDateString()}` : "Return window closed"}
                        </p>
                        <Button 
                          onClick={() => { setModalType("Return"); setModalOpen(true); }} 
                          disabled={!isReturnEligible}
                          variant="outline" className="w-full rounded-xl font-bold border-red-500/30 text-red-500 hover:bg-red-500/10"
                        >
                          Return Order
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-muted-foreground text-center">Order is currently in transit.</p>
                    )}
                  </>
                )}
                {(isCancelled || isReturned) && (
                  <div className="text-center font-bold text-sm text-muted-foreground">
                    No further actions available.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Vertical Tracker */}
          <div className="lg:col-span-1">
            <div className="bg-muted/10 p-6 rounded-3xl border border-border shadow-xs sticky top-24">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-6">Tracking Status</h3>
              
              {isCancelled || isReturned ? (
                <div className={`p-4 rounded-xl border flex items-center gap-3 font-bold text-sm ${isCancelled ? "bg-red-500/10 text-red-600 border-red-500/20" : "bg-gray-500/10 text-gray-600 border-gray-500/20"}`}>
                  {isCancelled ? <XCircle className="h-5 w-5" /> : <RefreshCcw className="h-5 w-5" />}
                  Order was {order.status.toLowerCase()}.
                </div>
              ) : (
                <div className="relative pl-6 space-y-8">
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border rounded-full z-0"></div>
                  
                  {STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStepIndex;
                    const isActive = idx === currentStepIndex;
                    
                    let StepIcon = Package;
                    if (step === "Confirmed") StepIcon = CheckCircle2;
                    if (step === "Processing") StepIcon = Loader;
                    if (step === "Shipped") StepIcon = Truck;
                    if (step === "Delivered") StepIcon = CheckCircle2;

                    return (
                      <div key={step} className="relative z-10 flex items-start gap-4">
                        <div className={`h-6 w-6 shrink-0 rounded-full flex items-center justify-center mt-[-2px] ml-[-23px] border-2 transition-colors ${
                          isCompleted ? 'bg-primary border-primary text-primary-foreground shadow-sm' : 'bg-card border-border text-muted-foreground'
                        }`}>
                          <StepIcon className="h-3 w-3" />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm font-bold leading-none ${isActive ? 'text-foreground' : isCompleted ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                            {step}
                          </span>
                          {step === "Delivered" && (
                            <span className="text-[10px] font-bold text-muted-foreground mt-1">
                              {isDelivered ? 'On ' : 'Est. '} {expectedDate.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* FIXED CANCEL / RETURN MODAL */}
      {modalOpen && modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm rounded-3xl border border-border shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-xl">{modalType === "Cancel" ? "Cancel Order" : "Return Order"}</h2>
              <button type="button" onClick={() => setModalOpen(false)} className="p-1.5 bg-muted rounded-full hover:bg-border transition-colors"><X className="h-4 w-4" /></button>
            </div>
            
            <form onSubmit={handleStatusUpdate} className="space-y-6">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Reason for {modalType.toLowerCase()}</label>
                <Dropdown 
                  value={modalReason} 
                  onChange={setModalReason} 
                  options={modalType === "Cancel" ? cancelOptions : returnOptions}
                  placeholder="Select a reason..."
                />
              </div>

              {modalType === "Return" && (
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Upload Images (Optional)</label>
                  <label className="flex flex-col items-center justify-center w-full h-24 bg-muted/30 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImagePlus className="w-6 h-6 text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground font-bold">{uploadedImages ? `${uploadedImages.length} files selected` : "Click to upload photos"}</p>
                    </div>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => setUploadedImages(e.target.files)} />
                  </label>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button type="button" onClick={() => setModalOpen(false)} variant="outline" className="flex-1 rounded-xl font-bold h-12 border-border hover:bg-muted text-foreground">
                  Back
                </Button>
                <Button type="submit" disabled={actionLoading || !modalReason} variant="destructive" className="flex-1 rounded-xl font-bold h-12">
                  {actionLoading ? "Processing..." : `Confirm ${modalType}`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {reviewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-xl">Write a Review</h2>
              <button onClick={() => setReviewProduct(null)} className="p-2 bg-muted rounded-full hover:bg-border transition-colors"><XCircle className="h-5 w-5" /></button>
            </div>
            
            <div className="flex items-center gap-4 mb-6 p-4 bg-muted/30 rounded-2xl border border-border">
              <img src={getFullUrl(reviewProduct.image_url)} alt="Product" className="h-12 w-12 rounded-lg object-cover mix-blend-multiply" />
              <p className="font-bold text-sm line-clamp-2">{reviewProduct.product_name}</p>
            </div>

            <form onSubmit={submitReview} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: star })} className="focus:outline-none transition-transform hover:scale-110">
                      <Star className={`h-8 w-8 ${reviewForm.rating >= star ? "fill-amber-500 text-amber-500" : "text-muted-foreground opacity-30"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Your Review</label>
                <textarea 
                  required rows={4} value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="What did you love about this toy?"
                />
              </div>
              <Button type="submit" disabled={isSubmittingReview} className="w-full rounded-xl font-bold h-12">
                {isSubmittingReview ? "Submitting..." : "Post Review"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}