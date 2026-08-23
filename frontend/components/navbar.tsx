"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Menu, X, ShoppingBag, Search, Heart, Sparkles, Baby, Blocks, Flame, Tag 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "All Toys", href: "/toys", icon: Blocks },
  { name: "By Age", href: "/age-groups", icon: Baby },
  { name: "Bestsellers", href: "/bestsellers", icon: Flame, badge: "Hot" },
  { name: "Special Offers", href: "/offers", icon: Tag, badge: "Sale" },
];

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  
  // Sync search input with the URL instantly
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  // Update cart count by reading localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("osworld_cart") || "[]");
      setCartCount(cart.reduce((total: number, item: any) => total + item.quantity, 0));
    };

    updateCartCount();
    // Listen for our custom event when an item is added
    window.addEventListener("cartUpdated", updateCartCount);
    return () => window.removeEventListener("cartUpdated", updateCartCount);
  }, []);

  // Fire this on every single keystroke!
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Updates the URL instantly without reloading the page
    if (query.trim()) {
      router.replace(`/?search=${encodeURIComponent(query)}`, { scroll: false });
    } else {
      router.replace(`/`, { scroll: false });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-xs">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        
        {/* Left: Mobile Hamburger & Brand */}
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
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-foreground leading-none">
                osworld
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-primary">
                Toys & Joy
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="relative flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-foreground/80 hover:text-primary hover:bg-muted rounded-xl">
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Desktop Search Bar */}
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

          <Link href="/cart" className="relative flex h-10 items-center gap-1.5 sm:gap-2 rounded-xl bg-primary px-3 sm:px-4 text-primary-foreground font-semibold shadow-xs hover:opacity-95 active:scale-95">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-bold">Cart</span>
            {cartCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-card text-foreground text-xs font-black shadow-xs">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 top-18 z-40 bg-foreground/50 md:hidden" />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 220 }} className="fixed inset-y-0 left-0 top-18 z-50 flex w-[85%] max-w-sm flex-col border-r border-border bg-card p-6 shadow-2xl md:hidden overflow-y-auto">
              
              {/* Mobile Search Bar! */}
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