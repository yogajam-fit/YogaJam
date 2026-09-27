"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { MasonryGrid } from "@/components/ui/MasonryGrid";
import { Lightbox } from "@/components/ui/Lightbox";

interface ImageItem {
  id: string | number;
  src: string;
  alt: string;
}

export function GalleryClient({ images }: { images: ImageItem[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  return (
    <>
      <MasonryGrid 
        items={images}
        renderItem={(image, index) => (
          <div 
            onClick={() => openLightbox(index)}
            className="relative group overflow-hidden bg-surface/50 rounded-lg md:rounded-xl border border-border/50 cursor-pointer"
          >
            <Image 
              src={image.src} 
              alt={image.alt}
              width={600}
              height={400}
              loading="lazy"
              className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 pointer-events-none" />
          </div>
        )}
      />

      {images.length === 0 && (
        <div className="py-20 text-center text-text-secondary w-full">
          No images in the gallery yet.
        </div>
      )}

      {selectedIndex !== null && (
        <Lightbox 
          images={images} 
          initialIndex={selectedIndex} 
          onClose={closeLightbox} 
        />
      )}
    </>
  );
}
