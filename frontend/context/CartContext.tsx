"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface CartContextType {
  cartItems: any[];
  updateQuantity: (product: any, delta: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
  totalItems: 0,
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("osworld_cart") || "[]");
    setCartItems(saved);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch(`http://127.0.0.1:8000/api/cart/${user.id}`)
      .then(res => res.json())
      .then(dbItems => {
        if (dbItems.length > 0) {
          setCartItems(dbItems);
          localStorage.setItem("osworld_cart", JSON.stringify(dbItems));
        }
      });
  }, [user]);

  const updateQuantity = (product: any, delta: number) => {
    let updatedCart = [...cartItems];
    const index = updatedCart.findIndex(item => item.id === product.id);

    if (index >= 0) {
      updatedCart[index].quantity += delta;
      if (updatedCart[index].quantity <= 0) updatedCart.splice(index, 1);
    } else if (delta > 0) {
      updatedCart.push({ ...product, quantity: 1 });
    }

    setCartItems(updatedCart);
    localStorage.setItem("osworld_cart", JSON.stringify(updatedCart));
    syncToBackend(updatedCart);
    
    // Failsafe: Broadcast the update so non-context components stay in sync
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const removeItem = (id: number) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("osworld_cart", JSON.stringify(updatedCart));
    syncToBackend(updatedCart);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("osworld_cart");
    syncToBackend([]);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const syncToBackend = (items: any[]) => {
    fetch("http://127.0.0.1:8000/api/cart/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map(i => ({ product_id: i.id, quantity: i.quantity })),
        user_id: user ? user.id : null
      })
    }).catch(err => console.error("Sync failed", err));
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, updateQuantity, removeItem, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext); 