import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Osworld | Kids Toys, Games & Joy",
  description: "Discover fun, educational, and creative toys for kids of all ages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased flex flex-col`}>
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}