"use client";

import * as React from "react";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function AboutSection() {
  return (
    <section id="about" className="relative z-20 w-full py-6 md:py-8 overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full flex flex-col justify-center">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-12">
          <div className="md:w-1/2 shrink-0">
            <SectionHeading 
              title={<>This isn&apos;t a workout.<br/>This is YogaJam.</>}
              subtitle={<span className="hidden md:inline">We blend high-energy movement, deep house beats, and an electric community to create wellness experiences you actually want to show up for.</span>}
              align="left"
            />
          </div>
          
          <div className="md:w-1/2 flex justify-center md:justify-end">
            <div className="relative w-full max-w-[400px] h-[300px] sm:h-[400px] lg:h-[450px]">
              <Image 
                src="/images/What_Are_We.png"
                alt="What are we"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

