"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Menu, X, ShoppingBag, Search, Sparkles, Baby, Blocks, Flame, Tag, User as UserIcon, LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { name: "All Toys", href: "/toys", icon: Blocks },
  { name: "By Age", href: "/age-groups", icon: Baby },
  { name: "Bestsellers", href: "/bestsellers", icon: Flame, badge: "Hot" },
  { name: "Special Offers", href: "/offers", icon: Tag, badge: "Sale" },
];

export default function Navbar() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { totalItems } = useCart(); 
  const { user, logout } = useAuth();
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      setSearchQuery(urlParams.get("search") || "");
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      router.replace(`/?search=${encodeURIComponent(query)}`, { scroll: false });
    } else {
      router.replace(`/`, { scroll: false });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-xs">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-all hover:bg-muted md:hidden"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xs transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-foreground leading-none">osworld</span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-primary">Toys & Joy</span>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="relative flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-foreground/80 hover:text-primary hover:bg-muted rounded-xl">
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden lg:flex relative">
            <input
              type="text"
              placeholder="Search toys..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="h-10 w-48 rounded-xl border border-border bg-background pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <Link href="/cart" className="relative flex h-10 items-center gap-1.5 sm:gap-2 rounded-xl bg-primary px-3 sm:px-4 text-primary-foreground font-semibold shadow-xs hover:opacity-90 active:scale-95 transition-all">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-bold">Cart</span>
            {totalItems > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-card text-foreground text-xs font-black shadow-xs">
                {totalItems}
              </span>
            )}
          </Link>

          <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-border ml-1">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">Hi, {user.name.split(' ')[0]}</span>
                <button onClick={logout} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-muted" title="Logout">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link href="/auth" className="flex h-10 items-center gap-1.5 sm:gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-3 sm:px-4 text-white hover:text-white font-semibold shadow-xs active:scale-95 transition-all border-0">
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline text-xs font-bold">Sign In</span>
              </Link>
            )}
          </div>

        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 top-18 z-40 bg-foreground/50 md:hidden" />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 220 }} className="fixed inset-y-0 left-0 top-18 z-50 flex w-[85%] max-w-sm flex-col border-r border-border bg-card p-6 shadow-2xl md:hidden overflow-y-auto">
              
              <div className="mb-6 pb-6 border-b border-border">
                {user ? (
                  <div className="flex items-center justify-between bg-muted/50 p-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                    <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="p-2 text-muted-foreground hover:text-destructive">
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white hover:text-white active:scale-95 transition-all rounded-xl font-bold border-0">
                    <UserIcon className="h-5 w-5" /> Sign In or Register
                  </Link>
                )}
              </div>

              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Search toys..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>

              <nav className="flex flex-col space-y-2 mb-6">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold text-foreground hover:bg-muted">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background border border-border text-primary"><Icon className="h-5 w-5" /></div>
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}