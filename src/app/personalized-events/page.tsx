"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { BuildYourOwnModal } from "@/components/ui/BuildYourOwnModal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EventCard } from "@/components/ui/EventCard";

import { personalizedEventsData as personalizedEvents } from "@/content/personalized-events";

export default function PersonalizedEventsPage() {
  const [activeCategory, setActiveCategory] = React.useState("All");
  const dynamicCategories = Array.from(new Set(personalizedEvents.map(e => e.label))).filter(Boolean);
  const categories = ["All", ...dynamicCategories];
  return (
    <main className="flex-1 pt-24 md:pt-32 pb-16 md:pb-24 bg-background">
      <Container>


        {/* Filters */}
        <div className="flex md:flex-wrap items-center gap-3 mb-6 md:mb-8 overflow-x-auto md:overflow-visible pb-2 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-accent text-background shadow-[0_0_15px_rgba(200,232,107,0.4)]"
                  : "bg-surface/50 border border-border text-foreground-secondary hover:text-foreground hover:bg-surface"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
          {/* Static "Build Your Own" Card */}
          {activeCategory === "All" && (
          <BuildYourOwnModal>
            <div
              className="group relative flex flex-col items-center justify-center rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 aspect-square md:aspect-auto md:h-[360px] bg-surface/30 border-2 border-dashed border-border hover:border-accent/50 hover:bg-surface/50 hover:shadow-[0_0_30px_rgba(200,232,107,0.05)] cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center gap-2 md:gap-4 text-center p-4 md:p-6 w-full h-full relative z-10">
                <div className="w-full flex items-center justify-center transition-transform duration-500 group-hover:-translate-y-1">
                  <svg className="w-8 h-8 md:w-12 md:h-12 mx-auto text-foreground-secondary group-hover:text-accent transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="w-full flex flex-col items-center text-center">
                  <h3 className="text-base sm:text-lg md:text-2xl font-bold font-heading text-foreground group-hover:text-accent transition-colors duration-500 md:mb-2 w-full text-center leading-tight">Build Your<br className="md:hidden" /> Own</h3>
                  <p className="hidden md:block text-foreground-secondary text-sm max-w-[220px] mx-auto text-center">Create a fully custom experience from scratch</p>
                </div>
              </div>
            </div>
          </BuildYourOwnModal>
          )}

          {/* Dynamic Personalized Events */}
          {personalizedEvents
            .filter((item) => activeCategory === "All" || item.label === activeCategory)
            .map((item) => {
            return (
              <EventCard
                key={item.id}
                href={`/personalized-events/${item.id}`}
                image={item.image || "/images/hero/hero-bg.jpg"}
                image_mobile={(item as any).image_mobile}
                badgeText={item.label}
                title={item.title}
                detail1Icon={<svg className="w-4 h-4 text-accent-dark flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                detail1Text={item.size}
                detail2Icon={<svg className="w-4 h-4 text-accent-dark flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                detail2Text={item.location}
                previewDesc={item.previewDesc}
                actionText="Explore"
              />
            );
          })}
        </div>
      </Container>
    </main>
  );
}
