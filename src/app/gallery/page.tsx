import React from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { GalleryClient } from "./GalleryClient";


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
      {/* Uniform Grid Gallery with Lightbox */}
      <div className="max-w-7xl mx-auto px-6">
        <GalleryClient images={images} />
      </div>
    </div>
  );
}
