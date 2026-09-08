"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";

const items = [
  { icon: "🧘", text: "Looking for a different way to move" },
  { icon: "🎉", text: "Looking for a healthier way to celebrate" },
  { icon: "🫂", text: "Looking to meet people" },
  { icon: "🏢", text: "Looking to bring your team together" },
  { icon: "🌴", text: "Looking for an experience outside the routine" }
];

export function AboutSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-rotate on mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeIndex]);

  return (
    <section id="about" className="relative z-20 w-full py-12 md:py-16 overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full flex flex-col justify-center">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-12">
          <div className="md:w-1/2 shrink-0">
            <SectionHeading 
              title={<>This isn&apos;t a workout.<br/>This is YogaJam.</>}
              subtitle="We blend high-energy movement, deep house beats, and an electric community to create wellness experiences you actually want to show up for."
              align="left"
            />
          </div>
          
          <div className="md:w-1/2 flex justify-center md:justify-end mt-12 md:mt-0">
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

        {/* Desktop Layout */}
        <div className="hidden md:block w-full mt-12">
          <h3 className="text-center text-sm font-bold tracking-[0.2em] text-foreground/40 uppercase mb-12">Come if you&apos;re...</h3>
          <div className="grid grid-cols-5 gap-4">
            {items.map((item, i) => (
              <div 
                key={i} 
                className="group animate-float flex flex-col items-center text-center gap-4 p-6 rounded-2xl bg-surface border border-border hover:bg-surface-elevated hover:border-accent/30 hover:shadow-[0_0_20px_rgba(200,232,107,0.1)] transition-all duration-500"
                style={{ animationDelay: `${i * 0.4}s` }}
              >
                <span className="text-3xl grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">{item.icon}</span>
                <span className="text-xs text-foreground-secondary font-medium leading-relaxed group-hover:text-accent-warm transition-colors">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Circular Layout */}
        <div className="md:hidden flex flex-col items-center justify-center w-full mt-16 mb-8">
          <h3 className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-foreground/40 uppercase mb-8">Come if you&apos;re...</h3>
          <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex items-center justify-center">
            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-12 sm:px-14 z-10 pointer-events-none">
              <p className="text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/60 text-lg sm:text-xl font-heading font-bold leading-snug animate-in fade-in zoom-in-95 duration-500 drop-shadow-sm" key={activeIndex}>
                {items[activeIndex].text}
              </p>
            </div>
            
            {/* Orbiting Emojis */}
            {items.map((item, i) => {
              const angle = (i * 72); // Symmetrical around the Y-axis
              return (
                <div 
                  key={i}
                  className="absolute top-1/2 left-1/2 w-full h-full pointer-events-none"
                  style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)` }}
                >
                  <button 
                    onClick={() => setActiveIndex(i)}
                    className={`absolute top-0 left-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl transition-all duration-500 pointer-events-auto border-2 ${
                      activeIndex === i 
                        ? "bg-surface-elevated border-accent shadow-[0_0_20px_rgba(200,232,107,0.3)] grayscale-0 opacity-100 z-20" 
                        : "bg-surface border-border grayscale opacity-50 hover:grayscale-0 hover:opacity-100 z-10"
                    }`}
                    style={{ transform: `translate(-50%, -50%) rotate(${-angle}deg)` }}
                  >
                    {item.icon}
                  </button>
                </div>
              );
            })}
            
            {/* Subtle dashed orbit ring */}
            <div className="absolute inset-0 border border-dashed border-border rounded-full animate-[spin_60s_linear_infinite] pointer-events-none" />
          </div>
        </div>

      </div>
    </section>
  );
}
