import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { AuthProvider } from "@/context/AuthContext";
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
        <Navbar />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
   