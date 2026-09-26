"use client";

import * as React from "react";
import { useState } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PreviewWheel } from "@/components/ui/PreviewWheel";
import Link from "next/link";
import { heroEvergreenData, heroFallbackData } from "@/content/hero";

// Default items if none are provided (for preview purposes)
const previewItems = [...heroEvergreenData, ...heroFallbackData];

const getOrigUrl = (url: string | undefined | null) => {
  if (!url) return undefined;
  if (!url.includes('ik.imagekit.io')) return url;
  return url.includes('?') ? `${url}&tr=orig-true` : `${url}?tr=orig-true`;
};


export function Hero({ items = previewItems }: { items?: any[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const activeItem = items[activeIndex];

  // Autoplay logic: show image for 3s, then video (if exists) or wait another 3s
  React.useEffect(() => {
    // Reset to showing image when slide changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowVideo(false);

    let nextTimeout: NodeJS.Timeout;

    const initialTimeout = setTimeout(() => {
      // TypeScript safety: check if video or video_mobile property exists
      const hasVideo = "video" in activeItem && activeItem.video;
      const hasMobileVideo = "video_mobile" in activeItem && activeItem.video_mobile;
      if (hasVideo || hasMobileVideo) {
        setShowVideo(true);
      } else {
        // No video, wait another 3 seconds (6s total) then move to next
        nextTimeout = setTimeout(() => {
          setActiveIndex((prev) => (prev + 1) % items.length);
        }, 3000);
      }
    }, 3000);

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(nextTimeout);
    };
  }, [activeIndex, activeItem]);

  // Scroll active mobile thumbnail into view
  React.useEffect(() => {
    const el = document.getElementById(`hero-mobile-thumb-${activeIndex}`);
    const container = document.getElementById('hero-mobile-slider');
    if (el && container) {
      const scrollLeft = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeIndex]);

  return (
    <section className="relative w-full min-h-[85svh] h-auto md:h-auto md:min-h-0 pt-[15vh] md:pt-[12vh] pb-4 md:pb-0 flex items-end md:items-center bg-background md:bg-transparent overflow-hidden">
      {/* Background Media with Dark Overlay */}
      <div className="absolute inset-0 md:fixed md:inset-0 z-0 bg-black overflow-hidden">
        {/* Images (Cross-faded) */}
        {items.map((item, idx) => {
          const isActive = idx === activeIndex;
          const isVideoPlaying = isActive && showVideo && (item.video || item.video_mobile);
          
          return (
            <div 
              key={item.id} 
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            >
              {item.image_mobile ? (
                <>
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="100vw"
                    priority={idx === 0}
                    className={`hidden md:block object-cover object-center md:object-right transition-opacity duration-1000 ease-in-out ${isVideoPlaying ? "opacity-0" : "opacity-100"}`}
                  />
                  <Image
                    src={item.image_mobile}
                    alt={item.title}
                    fill
                    sizes="100vw"
                    priority={idx === 0}
                    className={`md:hidden object-cover object-center transition-opacity duration-1000 ease-in-out ${isVideoPlaying ? "opacity-0" : "opacity-100"}`}
                  />
                </>
              ) : (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="100vw"
                  priority={idx === 0}
                  className={`object-cover object-center md:object-right transition-opacity duration-1000 ease-in-out ${isVideoPlaying ? "opacity-0" : "opacity-100"}`}
                />
              )}
            </div>
          );
        })}

        {/* Video Player */}
        {showVideo && ("video" in activeItem || "video_mobile" in activeItem) && (
          <video
            key={activeIndex}
            ref={(el) => {
              if (el && el.paused) {
                const playPromise = el.play();
                if (playPromise !== undefined) {
                  playPromise.catch((error) => {
                    if (error.name === 'NotAllowedError') {
                      setIsMuted(true);
                    }
                  });
                }
              }
            }}
            autoPlay
            muted={isMuted}
            playsInline
            preload="metadata"
            onEnded={() => setActiveIndex((prev) => (prev + 1) % items.length)}
            className="absolute inset-0 w-full h-full object-cover opacity-100 animate-in fade-in duration-500"
          >
            {activeItem.video_mobile && (
              <source src={`${getOrigUrl(activeItem.video_mobile as string)}#t=0.001`} media="(max-width: 768px)" type="video/mp4" />
            )}
            {activeItem.video && (
              <source src={`${getOrigUrl(activeItem.video as string)}#t=0.001`} type="video/mp4" />
            )}
          </video>
        )}

        {/* Cinematic gradient overlays */}
        {/* Mobile: Cinematic bottom gradient to provide text readability without muting the top of the photo */}
        <div className={`absolute inset-0 bg-gradient-to-t from-background from-10% via-background/80 via-40% to-transparent to-70% z-10 pointer-events-none md:hidden transition-opacity duration-1000 ease-in-out ${showVideo ? "opacity-70" : "opacity-100"}`} />
        
        {/* Desktop overlays */}
        <div className={`hidden md:block absolute inset-0 bg-gradient-to-r from-background via-background/90 via-30% to-transparent to-60% z-10 pointer-events-none transition-opacity duration-1000 ease-in-out ${showVideo ? "opacity-60" : "opacity-100"}`} />
        <div className={`hidden md:block absolute inset-0 bg-gradient-to-t from-background via-background/0 via-50% to-transparent z-10 pointer-events-none transition-opacity duration-1000 ease-in-out ${showVideo ? "opacity-30" : "opacity-100"}`} />
        <div className={`hidden md:block absolute inset-0 bg-gradient-to-b from-background/80 via-background/0 via-20% to-transparent z-10 pointer-events-none transition-opacity duration-1000 ease-in-out ${showVideo ? "opacity-0" : "opacity-100"}`} />
      </div>

      {/* Mobile Mute/Unmute Button (Floating Top Right) */}
      {showVideo && "video" in activeItem && activeItem.video && (
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute md:hidden z-30 top-24 right-4 w-10 h-10 rounded-full bg-surface/50 backdrop-blur-md border border-border flex items-center justify-center text-foreground hover:bg-surface hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
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

          <div className="relative w-full h-[190px] md:h-[280px] lg:h-[320px] xl:h-[360px]">
            {items.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div 
                  key={item.id} 
                  className={`absolute bottom-0 left-0 w-full flex flex-col justify-end items-start ${
                    isActive 
                      ? "transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] opacity-100 translate-y-0 pointer-events-auto" 
                      : "opacity-0 translate-y-4 pointer-events-none" // instantly disappears and resets position
                  }`}
                >
                  <h1 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white font-heading mb-2 md:mb-3 leading-tight drop-shadow-xl">
                    {item.title}
                    <span className="text-white/80 font-medium block mt-1">{item.subtitle}</span>
                  </h1>
                  {item.eventId && (
                    <span className="text-accent text-xs md:text-sm font-bold uppercase tracking-widest mb-3 md:mb-4 block drop-shadow-md">
                      {item.isPast ? "Recent Event" : "Upcoming Event"}
                    </span>
                  )}

                  <div className="flex flex-wrap items-center justify-start gap-1.5 md:gap-3 px-2.5 py-1 md:px-0 md:py-0 bg-accent-warm/90 md:bg-transparent rounded-full text-[9px] md:text-sm font-bold md:font-semibold text-background md:text-accent-warm mb-3 md:mb-4 tracking-wider uppercase shadow-md md:shadow-none">
                    <span>{item.duration}</span>
                    <span className="shrink-0 inline-block w-1 h-1 rounded-full bg-background/40 md:bg-accent-warm"></span>
                    <span>{item.venue}</span>
                  </div>

                  <p className="text-white/90 text-[13px] md:text-base max-w-xl leading-snug md:leading-relaxed font-medium line-clamp-2 md:line-clamp-3 overflow-hidden drop-shadow-md">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* CTA Buttons & Desktop Mute Button */}
          <div className="flex items-center mt-4 md:mt-8 w-full">
            <Button asChild size="lg" variant="primary" className="w-[75%] h-11 md:h-12 shadow-lg shadow-accent/20 overflow-hidden p-0 text-[13px] md:text-base">
              <Link href={activeItem.link || "/events"} className="w-full flex items-center justify-center px-8 md:px-10 py-2 md:py-3">
                {activeItem.eventId ? "Book Experience" : "Learn More"}
              </Link>
            </Button>

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

          {/* Mobile Horizontal Previews (Circular Tabs) */}
          <div 
            id="hero-mobile-slider" 
            className="flex lg:hidden overflow-x-auto scroll-smooth snap-x snap-mandatory gap-2.5 mt-6 md:mt-10 mb-2 w-full max-w-[300px] sm:max-w-[360px] mx-auto pb-4 pt-2 items-center px-4 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {items.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={idx}
                  id={`hero-mobile-thumb-${idx}`}
                  onClick={() => setActiveIndex(idx)}
                  className={`relative flex-shrink-0 w-11 h-11 sm:w-14 sm:h-14 rounded-full overflow-hidden snap-center transition-all duration-300 ease-out ${
                    isActive 
                      ? "scale-100 opacity-100 shadow-[0_0_8px_rgba(251,191,36,0.5)] ring-1 ring-accent z-10" 
                      : "scale-90 opacity-80 hover:opacity-100"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                >
                  <Image
                    src={item.image_mobile || item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 48px, 64px"
                    className="object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
