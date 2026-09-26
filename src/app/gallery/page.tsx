import React from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { MasonryGrid } from "@/components/ui/MasonryGrid";


export const metadata = {
  title: "Gallery | YogaJam",
  description: "A visual journey through our high-energy wellness experiences, deep house beats, and electric community.",
};

export default async function GalleryPage() {
  const supabase = await createClient();
  const { data: dbImages } = await supabase
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: false });

  const images = dbImages && dbImages.length > 0 
    ? dbImages.map(img => ({ id: img.id, src: img.url, alt: "Gallery Image" }))
    : [];
  return (
    <div className="flex-1 bg-background pt-24 md:pt-32 pb-16 md:pb-24">
      {/* Uniform Grid Gallery */}
      <div className="max-w-7xl mx-auto px-6">
        <MasonryGrid 
          items={images}
          renderItem={(image) => (
            <div 
              className="relative group overflow-hidden bg-surface/50 rounded-lg md:rounded-xl border border-border/50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={image.src} 
                alt={image.alt}
                loading="lazy"
                className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              
              {/* Subtle hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 pointer-events-none" />
            </div>
          )}
        />
        {images.length === 0 && (
          <div className="py-20 text-center text-text-secondary w-full">
            No images in the gallery yet.
          </div>
        )}
      </div>
    </div>
  );
}
