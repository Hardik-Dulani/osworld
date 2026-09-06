"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Package, Truck, XCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/orders/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Order not found");
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [params.id]);

  const getFullUrl = (url: string) => {
    if (!url) return "";
    return url.startsWith('http') ? url : `http://127.0.0.1:8000${url}`;
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-muted-foreground">Fetching Order Details...</div>;
  if (!order) return <div className="min-h-screen flex flex-col items-center justify-center space-y-4"><h1 className="text-2xl font-black">Order Not Found</h1><Button onClick={() => router.push('/')} variant="outline" className="rounded-xl">Go Back Home</Button></div>;

  // Status Badge Styling Logic
  let StatusIcon = Package;
  let statusColor = "bg-blue-500/10 text-blue-500 border-blue-500/20";
  
  if (order.status === "Shipped") {
    StatusIcon = Truck;
    statusColor = "bg-amber-500/10 text-amber-500 border-amber-500/20";
  } else if (order.status === "Delivered") {
    StatusIcon = CheckCircle2;
    statusColor = "bg-green-500/10 text-green-500 border-green-500/20";
  } else if (order.status === "Cancelled") {
    StatusIcon = XCircle;
    statusColor = "bg-red-500/10 text-red-500 border-red-500/20";
  }

  return (
    <main className="min-h-screen bg-background pb-24 lg:pt-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        
        <button onClick={() => router.push('/')} className="mb-8 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </button>

        {/* CONFIRMATION HERO */}
        <div className="bg-card p-8 rounded-3xl border border-border shadow-sm text-center mb-8">
          <div className="mx-auto h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-black text-foreground mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground font-medium">Thank you for bringing joy to the world, {order.full_name.split(" ")[0]}.</p>
        </div>

        {/* ORDER DETAILS CARD */}
        <div className="bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="font-extrabold text-xl">Order #{order.id}</h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm ${statusColor}`}>
              <StatusIcon className="h-4 w-4" /> {order.status}
            </div>
          </div>

          <div className="space-y-4 mb-8 border-t border-b border-border py-6">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex gap-4 items-center">
                <div className="h-16 w-16 shrink-0 bg-muted rounded-xl overflow-hidden border border-border/50">
                  <img src={getFullUrl(item.image_url)} alt={item.product_name} className="h-full w-full object-cover mix-blend-multiply" />
                </div>
                <div className="flex-1">
                  <h3 className="font-extrabold text-sm line-clamp-1">{item.product_name}</h3>
                  <p className="text-xs font-bold text-muted-foreground mt-1">Qty: {item.quantity}</p>
                </div>
                <div className="font-black text-foreground">
                  ₹{(item.price_at_time * item.quantity).toFixed(0)}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-8">
            <div className="flex-1">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Shipping To</h3>
              <p className="text-sm font-bold text-foreground bg-muted/30 p-4 rounded-2xl border border-border">
                {order.full_name}<br/>
                {order.email}<br/>
                {order.address}
              </p>
            </div>

            <div className="flex-1 space-y-3 text-sm font-medium text-muted-foreground">
              <div className="flex justify-between items-end mt-4">
                <span className="text-base text-foreground font-bold">Total Paid</span>
                <span className="text-3xl font-black text-foreground">₹{order.total_amount.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}