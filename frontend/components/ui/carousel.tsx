"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Carousel({ children }: { children: React.ReactNode[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      // Scrolls exactly one full container width at a time
      const amount = scrollRef.current.clientWidth;
      scrollRef.current.scrollBy({ 
        left: direction === "left" ? -amount : amount, 
        behavior: "smooth" 
      });
    }
  };

  return (
    <div className="relative group w-full">
      {/* Native scroll container hiding the scrollbar */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 [&::-webkit-scrollbar]:hidden"
      >
        {children.map((child, index) => (
          <div key={index} className="snap-center shrink-0">
            {child}
          </div>
        ))}
      </div>

      {/* Floating Action Arrows (Visible on Desktop Hover) */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="h-5 w-5 text-foreground" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="h-5 w-5 text-foreground" />
      </button>
    </div>
  );
}