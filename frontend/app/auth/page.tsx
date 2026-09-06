"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function AuthPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    
    try {
      const res = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        // 1. Log the user in globally
        login({ id: data.id, name: data.name, email: data.email });
        
        // 2. READ LOCAL STORAGE AND PUSH TO DATABASE!
        const localCart = JSON.parse(localStorage.getItem("osworld_cart") || "[]");
        if (localCart.length > 0) {
          await fetch("http://127.0.0.1:8000/api/cart/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: localCart.map((i: any) => ({ product_id: i.id, quantity: i.quantity })),
              user_id: data.id
            })
          }).catch(err => console.error("Failed to sync cart", err));
        }
        
        // 3. Redirect back to Cart and Auto-Open Checkout
        router.push("/cart?checkout=true");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <button 
        onClick={() => router.back()} 
        className="absolute top-6 left-6 flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-xs hover:bg-muted transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <div className="w-full max-w-md bg-card p-8 sm:p-10 rounded-3xl border border-border shadow-xl">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
        
        <h1 className="text-2xl font-black text-center text-foreground mb-2">
          {isLogin ? "Welcome Back" : "Create an Account"}
        </h1>
        <p className="text-sm text-center text-muted-foreground mb-8 font-medium">
          {isLogin ? "Enter your details to access your cart." : "Sign up to track orders and save favorites."}
        </p>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm font-bold p-3 rounded-xl mb-6 text-center border border-destructive/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Full Name</label>
              <input 
                type="text" 
                required={!isLogin}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Email Address</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="hello@example.com"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Password</label>
            <input 
              type="password" 
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl font-black mt-2 text-base">
            {isLoading ? "Please wait..." : isLogin ? <><LogIn className="mr-2 h-5 w-5"/> Sign In</> : <><UserPlus className="mr-2 h-5 w-5"/> Create Account</>}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }} 
            className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </main>
  );
}