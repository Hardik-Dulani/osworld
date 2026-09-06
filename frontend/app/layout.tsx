import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar"; // <-- Swapped!
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Osworld Toys & Joy",
  description: "Premium toys for kids",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <ConditionalNavbar /> {/* <-- Now hides automatically on /auth! */}
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}