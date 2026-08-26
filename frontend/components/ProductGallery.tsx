"use client";

import { useState, useEffect } from "react";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductGallery({ product }: { product: any }) {
  
  // COMBINE: Always put the main image at the absolute front of the array
  const allMedia = [
    { id: "main", media_url: product.image_url, is_video: false },
    ...(product.gallery || [])
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const activeMedia = allMedia[currentIndex];

  // Reset to first slide if the user navigates to a totally different product
  useEffect(() => {
    setCurrentIndex(0);
  }, [product.id, product.image_url]); 

  // FOOLPROOF VIDEO DETECTOR: Ignores the database and checks the actual file extension
  const isVideoFile = (media: any) => {
    if (media.is_video) return true;
    if (!media.media_url) return false;
    return /\.(mp4|webm|ogg|mov)$/i.test(media.media_url);
  };

  // 3-SECOND AUTOSCROLL LOGIC
  useEffect(() => {
    // Pause if hovering, if it's a video, or if there's only 1 item
    if (allMedia.length <= 1 || isHovered || isVideoFile(activeMedia)) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allMedia.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [currentIndex, isHovered, activeMedia, allMedia.length]);

  const goNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % allMedia.length);
  };

  const goPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  // FOOLPROOF URL BUILDER: Fixes missing slashes automatically
  const getFullUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith('http')) return url;
    return url.startsWith('/') ? `http://127.0.0.1:8000${url}` : `http://127.0.0.1:8000/${url}`;
  };

  if (!activeMedia) return null;

  return (
    <div className="w-full lg:w-[40%] flex flex-col-reverse lg:flex-row gap-3 lg:gap-4 lg:h-[500px]">
      
      {/* THUMBNAIL STACK */}
      <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto px-1 pb-2 lg:pb-0 lg:w-20 shrink-0 [&::-webkit-scrollbar]:hidden">
        {allMedia.map((media: any, index: number) => {
          const isVid = isVideoFile(media);
          return (
            <button
              key={media.id || index}
              onClick={() => setCurrentIndex(index)}
              className={`relative aspect-square w-16 lg:w-full shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                currentIndex === index 
                  ? "border-primary shadow-md scale-95" 
                  : "border-transparent hover:border-primary/50 opacity-60 hover:opacity-100"
              }`}
            >
              {isVid ? (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                  <Play className="h-6 w-6 fill-white text-white" />
                </div>
              ) : (
                <img
                  src={getFullUrl(media.media_url)}
                  alt={`Thumbnail ${index}`}
                  className="h-full w-full object-cover mix-blend-multiply bg-muted"
                />
              )}
            </button>
          )
        })}
      </div>

      {/* MAIN PREVIEW VIEWER */}
      <div 
        className="group relative flex-1 bg-muted/30 lg:rounded-3xl border border-border overflow-hidden aspect-square lg:aspect-auto flex items-center justify-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {product.badge && (
          <span className="absolute top-4 left-4 z-20 rounded-xl bg-accent px-3 py-1.5 text-xs font-black text-accent-foreground shadow-sm pointer-events-none">
            {product.badge}
          </span>
        )}

        {/* LEFT / RIGHT CAROUSEL ARROWS */}
        {allMedia.length > 1 && (
          <>
            <button 
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 flex items-center justify-center rounded-full bg-background/60 backdrop-blur-md shadow-md text-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background hover:scale-110"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 flex items-center justify-center rounded-full bg-background/60 backdrop-blur-md shadow-md text-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background hover:scale-110"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
        
        {/* SMOOTH CROSSFADING MEDIA LAYERS */}
        {allMedia.map((media: any, index: number) => {
          const isActive = index === currentIndex;
          const isVid = isVideoFile(media);
          const mediaUrl = getFullUrl(media.media_url);

          return (
            <div 
              key={media.id || index}
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {isVid ? (
                <video
                  src={mediaUrl}
                  controls={isActive}
                  autoPlay={isActive}
                  muted
                  loop
                  playsInline 
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt={`Product view ${index}`}
                  className="w-full h-full object-cover mix-blend-multiply"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}