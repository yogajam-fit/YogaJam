"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PreviewWheel } from "@/components/ui/PreviewWheel";
import Link from "next/link";
import { heroPreviewData as previewItems } from "@/content/hero";

export function Hero({ items = previewItems }: { items?: any[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const activeItem = items[activeIndex];

  // Autoplay logic: show image for 5s, then video (if exists) or wait another 5s
  React.useEffect(() => {
    // Reset to showing image when slide changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowVideo(false);

    let nextTimeout: NodeJS.Timeout;

    const initialTimeout = setTimeout(() => {
      // TypeScript safety: check if video property exists
      if ("video" in activeItem && activeItem.video) {
        setShowVideo(true);
      } else {
        // No video, wait another 5 seconds then move to next
        nextTimeout = setTimeout(() => {
          setActiveIndex((prev) => (prev + 1) % items.length);
        }, 5000);
      }
    }, 5000);

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(nextTimeout);
    };
  }, [activeIndex, activeItem]);

  return (
    <section className="relative w-full pt-[12vh] pb-0 flex items-center bg-transparent">
      {/* Background Media with Dark Overlay */}
      <div className="absolute w-full h-[100vh] md:fixed md:inset-0 z-0 bg-black overflow-hidden">
        <Image
          src={activeItem.image}
          alt={activeItem.title}
          fill
          sizes="100vw"
          priority
          className={`object-cover object-[70%_center] md:object-right transition-opacity duration-1000 ease-in-out ${showVideo ? "opacity-0" : "opacity-100"}`}
        />

        {showVideo && "video" in activeItem && activeItem.video && (
          <video
            src={activeItem.video as string}
            autoPlay
            muted={isMuted}
            playsInline
            onEnded={() => setActiveIndex((prev) => (prev + 1) % items.length)}
            className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-1000"
          />
        )}

        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 via-30% to-transparent to-60% z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/0 via-50% to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/0 via-20% to-transparent z-10 pointer-events-none" />

      </div>

      {/* Mobile Mute/Unmute Button (Floating Top Right) */}
      {showVideo && "video" in activeItem && activeItem.video && (
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute md:hidden z-[100] top-24 right-4 w-10 h-10 rounded-full bg-surface/50 backdrop-blur-md border border-border flex items-center justify-center text-foreground hover:bg-surface hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
      )}

      {/* Left Side: Preview Wheel (Anchored to exact left edge of max-width wrapper) */}
      {/* Uses flex items-center and pt-20 to precisely match the text's vertical alignment */}
      <div className="absolute inset-0 mx-auto w-full max-w-[1920px] pointer-events-none z-30 hidden lg:flex items-center pt-20">
        {/* Invisible mirror of the text+buttons block to guarantee perfect bottom alignment */}
        <div className="relative w-full lg:h-[400px] xl:h-[440px]">
          <div className="absolute left-0 bottom-0 pointer-events-none z-30 hidden lg:block">
            <PreviewWheel
              items={items}
              activeIndex={activeIndex}
              onActiveIndexChange={setActiveIndex}
            />
          </div>
        </div>
      </div>

      <Container className="relative z-20 flex flex-col md:flex-row items-center h-full pt-20">

        <div className="w-full lg:w-4/5 xl:w-3/5 flex flex-col justify-center text-left items-start lg:pl-[230px] xl:pl-[240px]">

          <div key={activeItem.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col justify-end items-start h-[190px] md:h-[280px] lg:h-[320px] xl:h-[360px]">
            <h1 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white font-heading mb-2 md:mb-3 leading-tight drop-shadow-xl">
              {activeItem.title}{" "}
              <span className="text-white/80 font-medium">{activeItem.subtitle}</span>
            </h1>

            <div className="flex flex-wrap items-center justify-start gap-1.5 md:gap-3 px-2.5 py-1 md:px-0 md:py-0 bg-accent-warm/90 md:bg-transparent rounded-full text-[9px] md:text-sm font-bold md:font-semibold text-background md:text-accent-warm mb-3 md:mb-4 tracking-wider uppercase shadow-md md:shadow-none">
              <span>{activeItem.duration}</span>
              <span className="shrink-0 inline-block w-1 h-1 rounded-full bg-background/40 md:bg-accent-warm"></span>
              <span>{activeItem.venue}</span>
            </div>

            {/* Fixed height ensures the description block is mathematically identical in height across all items so buttons don't jump */}
            <p className="text-white/90 text-[13px] md:text-base max-w-xl leading-snug md:leading-relaxed font-medium line-clamp-3 overflow-hidden drop-shadow-md">
              {activeItem.desc}
            </p>
          </div>

          {/* CTA Buttons & Desktop Mute Button */}
          <div className="flex items-center mt-4 md:mt-8 w-full">
            <div className="grid grid-cols-2 sm:grid-cols-[6fr_4fr] gap-3 md:gap-4 max-w-xl w-full">
              <Button asChild size="lg" variant="primary" className="w-full h-11 md:h-12 shadow-lg shadow-accent/20 overflow-hidden p-0 text-[13px] md:text-base">
                <Link href="/events" className="w-full h-full flex items-center justify-center px-2 md:px-8 py-2 md:py-3">Book Experience</Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full h-11 md:h-12 backdrop-blur-md bg-background/30 border-border hover:bg-foreground/ text-[13px] md:text-base text-white">
                Learn More
              </Button>
            </div>

            {/* Desktop Mute Button (Far Right, vertically aligned with CTAs) */}
            {showVideo && "video" in activeItem && activeItem.video && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="hidden md:flex absolute right-4 sm:right-6 lg:right-8 w-12 h-12 shrink-0 rounded-full bg-surface/50 backdrop-blur-md border border-border items-center justify-center text-foreground hover:bg-surface hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                aria-label={isMuted ? "Unmute video" : "Mute video"}
              >
                {isMuted ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
              </button>
            )}
          </div>

          {/* Mobile Pagination Dots */}
          <div className="flex lg:hidden items-center justify-center gap-2 mt-8 md:mt-12 mb-4 w-full">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 flex-shrink-0 ${idx === activeIndex ? "w-6 bg-accent shadow-[0_0_8px_rgba(251,191,36,0.6)]" : "w-2 bg-foreground/20 hover:bg-foreground/40"}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
