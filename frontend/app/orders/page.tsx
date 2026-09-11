"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Truck, CheckCircle2, XCircle, Clock, RefreshCcw, Loader, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
    if (isAuthLoading) return; // Wait for the auth check to finish!

    if (!user) {
      router.push("/auth"); // Kick guests to login
      return;
    }

    fetch(`process.env.NEXT_PUBLIC_API_URL/api/orders/user/${user.id}`)
      .then((res) => res.json())
      .then((data) => { setOrders(data); setIsLoading(false); })
      .catch(() => setIsLoading(false));
      
  }, [user, isAuthLoading, router]);

  const getFullUrl = (url: string) => url ? (url.startsWith('http') ? url : `process.env.NEXT_PUBLIC_API_URL${url}`) : "";

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Pending": return { icon: Clock, color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" };
      case "Confirmed": return { icon: CheckCircle2, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
      case "Processing": return { icon: Loader, color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" };
      case "Shipped": return { icon: Truck, color: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
      case "Delivered": return { icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
      case "Cancelled": return { icon: XCircle, color: "bg-red-500/10 text-red-500 border-red-500/20" };
      case "Returned": return { icon: RefreshCcw, color: "bg-gray-500/10 text-gray-500 border-gray-500/20" };
      default: return { icon: Package, color: "bg-muted text-muted-foreground border-border" };
    }
  };

  if (isAuthLoading || isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-muted-foreground">Loading your history...</div>;

  return (
    <main className="min-h-screen bg-background pb-24 lg:pt-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push('/')} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-xs hover:bg-muted transition-colors lg:hidden">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-card rounded-[2rem] border border-border shadow-xs">
            <Package className="h-12 w-12 text-secondary mb-4 opacity-50" />
            <h2 className="text-xl font-black text-foreground mb-2">No orders yet</h2>
            <Button onClick={() => router.push('/')} className="mt-4 rounded-xl font-bold">Start Shopping</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const { icon: StatusIcon, color: statusColor } = getStatusStyle(order.status);
              const createdDate = new Date(order.created_at);
              
              let expectedDate = order.expected_delivery_date 
                ? new Date(order.expected_delivery_date) 
                : new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);

              // NEW: Extend by 3 days if expected date has passed and not delivered
              const now = new Date();
              now.setHours(0,0,0,0);
              const expCopy = new Date(expectedDate);
              expCopy.setHours(0,0,0,0);

              if (expCopy.getTime() < now.getTime() && !["Delivered", "Cancelled", "Returned"].includes(order.status)) {
                expectedDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
              }

              const isDelivered = order.status === "Delivered";
              const isCancelledOrReturned = order.status === "Cancelled" || order.status === "Returned";

              return (
                <div key={order.id} className="block bg-card rounded-2xl border border-border shadow-xs hover:shadow-md hover:border-primary/40 transition-all p-4 sm:p-5">
                  {/* ROW 1: ID, Date & Status */}
                  <div className="flex justify-between items-start mb-4">
                    <Link href={`/order/${order.id}`} className="hover:text-primary transition-colors">
                      <h3 className="font-extrabold text-sm">Order #{order.id}</h3>
                      <p className="text-[10px] sm:text-xs font-bold text-muted-foreground mt-0.5">
                        {createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </Link>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-bold text-[10px] uppercase tracking-wider ${statusColor}`}>
                      <StatusIcon className="h-3.5 w-3.5" /> {order.status}
                    </div>
                  </div>

                  {/* ROW 2: Items & Expected Date */}
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      {order.items.slice(0, 3).map((item: any, idx: number) => (
                        <Link href={`/product/${item.product_id}`} key={idx} className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-muted border border-border/50 overflow-hidden relative hover:opacity-80 transition-opacity">
                          <img src={getFullUrl(item.image_url)} alt="toy" className="h-full w-full object-cover mix-blend-multiply" />
                        </Link>
                      ))}
                      {order.items.length > 3 && (
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-muted border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    
                    <Link href={`/order/${order.id}`} className="text-right hover:text-primary transition-colors">
                      {!isCancelledOrReturned && (
                        <>
                          <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            {isDelivered ? 'Delivered On' : 'Expected Arrival'}
                          </p>
                          <p className="text-sm font-black mt-0.5">
                            {expectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </>
                      )}
                      <p className="text-xs font-black mt-1">₹{order.total_amount.toFixed(0)}</p>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
} 