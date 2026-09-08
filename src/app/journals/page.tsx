import React from "react";
import Link from "next/link";
import Image from "next/image";
import { journals } from "@/content/journals";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata = {
  title: "Journals | YogaJam",
  description: "Explore our editorial collection of articles on wellness, community, music, and the modern YogaJam lifestyle.",
};

const getGridSpan = (size: string) => {
  switch (size) {
    case "large":
      return "md:col-span-2 md:row-span-2";
    case "tall":
      return "md:col-span-1 md:row-span-2";
    case "wide":
      return "md:col-span-2 md:row-span-1";
    case "standard":
    default:
      return "md:col-span-1 md:row-span-1";
  }
};

export default function JournalsPage() {
  const categories = ["All", "Culture", "Practices", "Wellness", "Community", "Music"];

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <header className="max-w-3xl">
          <SectionHeading 
            title="Journals"
            subtitle="Thoughts, interviews, and deep dives into the culture of modern wellness, sound, and movement."
            align="left"
            className="mb-6"
          />
        </header>
      </div>

      {/* Bento Box / Masonry Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 auto-rows-[350px]">
          {journals.map((journal) => (
            <article 
              key={journal.id} 
              className={`relative group overflow-hidden bg-surface ${getGridSpan(journal.gridSize)}`}
            >
              <Link href={`/journals/${journal.id}`} className="block w-full h-full relative">
                <Image 
                  src={journal.image} 
                  alt={journal.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity duration-500" />
                
                {/* Content Overlay */}
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                  <header className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <time dateTime={journal.date} className="text-sm font-medium text-foreground/70">
                        {new Date(journal.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </time>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold font-heading text-foreground mb-3 leading-tight group-hover:text-accent transition-colors duration-300">
                      {journal.title}
                    </h2>
                    <p className="text-foreground/80 line-clamp-2 text-sm md:text-base leading-relaxed">
                      {journal.excerpt}
                    </p>
                  </header>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
