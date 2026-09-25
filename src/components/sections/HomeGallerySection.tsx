"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

import { Container } from "@/components/ui/Container";
import Link from "next/link";

export function HomeGallerySection() {
  const [dbImages, setDbImages] = useState<{id: string, src: string, alt: string}[]>([]);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const exactScrollLeftRef = React.useRef<number>(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchImages() {
      const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setDbImages(data.map(img => ({ id: img.id, src: img.url, alt: "Gallery Image" })));
      }
    }
    fetchImages();
  }, []);

  const itemsToUse = dbImages.length > 0 ? dbImages : [];
  

  // Duplicate the array to create a seamless infinite marquee effect
  // We duplicate it to allow the scroll loop to jump back to 0 seamlessly
  const itemsToRender = [...itemsToUse, ...itemsToUse];

  const interactTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleInteractionStart = () => {
    setIsInteracting(true);
    if (interactTimeoutRef.current) {
      clearTimeout(interactTimeoutRef.current);
    }
  };

  const handleInteractionEnd = () => {
    if (interactTimeoutRef.current) {
      clearTimeout(interactTimeoutRef.current);
    }
    // Wait 2 seconds before resuming auto-scroll to let momentum scroll finish
    interactTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
      // Resync float tracker with actual scroll position
      if (scrollRef.current) {
        exactScrollLeftRef.current = scrollRef.current.scrollLeft;
      }
    }, 2000);
  };

  const handleScroll = () => {
    // Keep tracker in sync while user is manually scrolling
    if (isInteracting && scrollRef.current) {
      exactScrollLeftRef.current = scrollRef.current.scrollLeft;
    }
  };

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    
    // Init float tracker
    if (scrollRef.current && exactScrollLeftRef.current === 0) {
      exactScrollLeftRef.current = scrollRef.current.scrollLeft;
    }
    
    const autoScroll = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;
      
      if (scrollRef.current && !isInteracting) {
        // Accumulate exact scroll position safely
        exactScrollLeftRef.current += deltaTime * 0.05;
        
        // Loop back logic
        const maxScroll = scrollRef.current.scrollWidth / 2;
        if (exactScrollLeftRef.current >= maxScroll) {
          exactScrollLeftRef.current -= maxScroll;
        }
        
        scrollRef.current.scrollLeft = exactScrollLeftRef.current;
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };
    
    animationFrameId = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isInteracting]);

  // Clean up timeout
  useEffect(() => {
    return () => {
      if (interactTimeoutRef.current) clearTimeout(interactTimeoutRef.current);
    };
  }, []);

  if (itemsToUse.length === 0) return null;

  return (
    <section className="py-12 md:py-16 relative overflow-hidden bg-background">
      <Container>
        <div className="flex items-end justify-between mb-4 md:mb-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-foreground leading-tight tracking-tight max-w-[70%]">
            <span className="md:hidden">Gallery</span>
            <span className="hidden md:inline">Glimpse from our events</span>
          </h2>
          <Link href="/gallery" className="text-foreground-secondary hover:text-accent font-medium text-xs md:text-sm flex items-center group transition-colors pb-1">
            <span>View all</span>
            <svg className="h-3 w-0 opacity-0 -translate-x-2 group-hover:w-3 md:group-hover:w-4 group-hover:opacity-100 group-hover:translate-x-1 group-hover:ml-1.5 transition-all duration-300 ease-out" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="relative flex w-full overflow-hidden group rounded-xl">
          {/* Left and Right Fade Overlays */}
          <div className="absolute top-0 left-0 w-[15%] h-full bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[15%] h-full bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <div 
            ref={scrollRef}
            onMouseEnter={handleInteractionStart}
            onMouseLeave={handleInteractionEnd}
            onTouchStart={handleInteractionStart}
            onTouchEnd={handleInteractionEnd}
            onTouchCancel={handleInteractionEnd}
            onScroll={handleScroll}
            className="flex w-full overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x"
          >
            {itemsToRender.map((image, index) => (
              <div 
                key={`${image.id}-${index}`} 
                className="relative shrink-0 h-[200px] sm:h-[280px] md:h-[350px] mx-2 md:mx-3 rounded-lg md:rounded-xl overflow-hidden group/image cursor-pointer border border-border/50 bg-surface/50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="h-full w-auto object-cover transition-transform duration-700 ease-out group-hover/image:scale-105"
                />
                {/* Subtle hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors duration-500 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
