"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

export interface LightboxImage {
  id: string | number;
  src: string;
  alt: string;
}

export interface LightboxProps {
  images: LightboxImage[];
  initialIndex: number;
  onClose: () => void;
}

export function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(initialIndex);
  
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const nextImage = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) nextImage();
    if (distance < -50) prevImage();
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, nextImage, prevImage]);

  // Handle body overflow
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const thumbContainerRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll the thumbnail strip to keep the selected image in view
  useEffect(() => {
    if (thumbContainerRef.current) {
      const container = thumbContainerRef.current;
      const innerWrapper = container.firstElementChild;
      if (innerWrapper) {
        const activeThumb = innerWrapper.children[selectedIndex] as HTMLElement;
        if (activeThumb) {
          // Calculate position to center the active thumbnail in the scroll view
          const scrollLeft = activeThumb.offsetLeft - (container.clientWidth / 2) + (activeThumb.clientWidth / 2);
          container.scrollTo({ left: scrollLeft, behavior: "smooth" });
        }
      }
    }
  }, [selectedIndex]);

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center"
      onClick={onClose} // Click background to close
    >
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-[10000]">
        <div className="flex items-center gap-4 text-white">
          <Image src="/images/logo-medium.svg" alt="YogaJam" width={200} height={68} className="w-auto h-12 sm:h-14 object-contain" unoptimized />
        </div>
        <button 
          onClick={onClose}
          className="p-2 text-white/70 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); prevImage(); }}
        className="absolute left-2 md:left-6 z-[10000] w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-white/80 hover:text-white transition-all bg-white/10 hover:bg-white/20 rounded-full hidden md:flex backdrop-blur-md"
        aria-label="Previous image"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div 
        className="w-full h-full flex items-center justify-center px-0 pb-28 pt-20 md:px-24 md:pb-36 md:pt-24 overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevent background click when clicking image
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Image 
          key={selectedIndex}
          src={images[selectedIndex].src}
          alt={images[selectedIndex].alt}
          width={1200}
          height={800}
          className="max-w-full max-h-full w-auto h-auto object-contain select-none shadow-2xl animate-in fade-in zoom-in-95 duration-300"
        />
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); nextImage(); }}
        className="absolute right-2 md:right-6 z-[10000] w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-white/80 hover:text-white transition-all bg-white/10 hover:bg-white/20 rounded-full hidden md:flex backdrop-blur-md"
        aria-label="Next image"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Thumbnail preview strip */}
      <div 
        ref={thumbContainerRef}
        className="absolute bottom-4 md:bottom-6 w-full z-[10000] overflow-x-auto text-center [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="inline-flex items-center gap-2 px-4 w-max min-w-full justify-center">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(i)}
              className={`relative w-16 h-12 md:w-20 md:h-14 shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                i === selectedIndex 
                  ? 'border-white opacity-100 shadow-[0_0_15px_rgba(255,255,255,0.15)]' 
                  : 'border-transparent opacity-40 hover:opacity-100'
              }`}
            >
              <Image src={img.src} alt={img.alt} width={80} height={56} className="w-full h-full object-cover" />
              {i !== selectedIndex && <div className="absolute inset-0 bg-black/30 transition-opacity hover:opacity-0" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
