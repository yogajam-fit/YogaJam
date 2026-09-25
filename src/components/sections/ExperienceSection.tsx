"use client";

import { Container } from "@/components/ui/Container";
import { useState, useRef, useEffect } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { createClient } from "@/utils/supabase/client";

export function ExperienceSection() {
  const [experiences, setExperiences] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isInView, setIsInView] = useState(false);
  
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchChannel() {
      const { data } = await supabase.from('channel').select('*').order('created_at', { ascending: true });
      if (data && data.length > 0) {
        setExperiences(data.map(item => ({
          id: item.id,
          videoSrc: item.video_url
        })));
      }
      setIsLoading(false);
    }
    fetchChannel();
  }, []);

  // Swipe detection state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Intersection Observer for viewport playback
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.6 } // Trigger only when at least 60% of the section is visible to prevent Safari auto-scroll
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, []);

  // Play current video, pause others
  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      
      // We only want to force currentTime = 0 if we're actually changing videos,
      // not just scrolling in and out of view.
      if (idx === currentIndex) {
        if (isInView) {
          video.play().catch(e => console.log("Playback prevented:", e));
        } else {
          video.pause();
        }
      } else {
        video.pause();
        // reset inactive videos so they start from beginning next time
        video.currentTime = 0;
      }
    });
  }, [currentIndex, isInView]);

  const nextExperience = () => {
    setCurrentIndex((prev) => (prev + 1) % experiences.length);
  };

  const prevExperience = () => {
    setCurrentIndex((prev) => (prev - 1 + experiences.length) % experiences.length);
  };

  const setExperience = (idx: number) => {
    setCurrentIndex(idx);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextExperience();
    } else if (isRightSwipe) {
      prevExperience();
    }
  };

  return (
    <section ref={sectionRef} id="channel" className="py-6 md:py-8 relative z-10 bg-background overflow-hidden">
      <Container>
        <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-6 md:gap-16">
          
          {/* Left: Video Stack Layout */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center relative">
            {/* Deck Container */}
            <div 
              className="relative h-[65vh] md:h-[75vh] aspect-[10/16] shrink-0 mx-auto touch-pan-y rounded-2xl bg-black"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/50 rounded-2xl pointer-events-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/loader.svg" alt="Loading..." className="w-12 h-12 animate-pulse drop-shadow-xl" />
                </div>
              )}
              {experiences.map((exp, idx) => {
                const len = experiences.length;
                const diff = (idx - currentIndex + len) % len;

                // Stacked logic for both mobile and desktop
                let stackClasses = "";
                if (diff === 0) {
                  // Active Card
                  stackClasses = "z-20 translate-x-0 translate-y-0 opacity-100 scale-100 shadow-2xl";
                } else if (diff === 1) {
                  // Next Card (peeking from the right)
                  stackClasses = "z-10 translate-x-8 md:translate-x-12 translate-y-0 opacity-70 scale-95 brightness-50 cursor-pointer";
                } else if (diff === len - 1) {
                  // Previous Card (peeking from the left)
                  stackClasses = "z-10 -translate-x-8 md:-translate-x-12 translate-y-0 opacity-70 scale-95 brightness-50 cursor-pointer";
                } else if (diff === 2) {
                  // 3rd Card (peeking further right)
                  stackClasses = "z-0 translate-x-16 md:translate-x-20 translate-y-0 opacity-30 scale-90 brightness-25 pointer-events-none hidden md:block";
                } else if (diff === len - 2) {
                  // Card before previous (peeking further left)
                  stackClasses = "z-0 -translate-x-16 md:-translate-x-20 translate-y-0 opacity-30 scale-90 brightness-25 pointer-events-none hidden md:block";
                } else {
                  // Hidden Cards
                  stackClasses = "z-0 opacity-0 translate-x-0 translate-y-0 scale-90 pointer-events-none";
                }

                return (
                  <div
                    key={exp.id}
                    className={`absolute top-0 left-0 w-full h-full bg-[#0B0D0C] border border-border overflow-hidden rounded-2xl transition-all duration-700 ease-in-out ${stackClasses}`}
                    onClick={() => {
                      if (diff === 1) nextExperience();
                      if (diff === len - 1) prevExperience();
                    }}
                  >
                    <video
                      ref={(el) => { videoRefs.current[idx] = el; }}
                      muted={diff !== 0 || isMuted}
                      playsInline
                      preload={diff === 0 ? "auto" : "none"}
                      onEnded={nextExperience}
                      className="absolute inset-0 w-full h-full object-cover"
                    >
                      <source src={exp.videoSrc} type="video/mp4" />
                    </video>

                    {/* Mute Toggle (Only on Active Video) */}
                    {diff === 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMute();
                        }}
                        className="absolute bottom-4 right-4 z-30 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 hover:scale-110 transition-all duration-300"
                        aria-label={isMuted ? "Unmute video" : "Mute video"}
                      >
                        {isMuted ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
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
                );
              })}
            </div>

            {/* Navigation & Indicators */}
            <div className="flex items-center justify-center gap-6 w-full mt-8 md:mt-12">
              {/* Prev Button (Desktop Only) */}
              <button 
                onClick={prevExperience} 
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-surface border border-border text-foreground hover:bg-accent hover:border-accent hover:text-black transition-all duration-300 shadow-sm"
                aria-label="Previous video"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Dots */}
              <div className="flex items-center justify-center gap-3">
                {experiences.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setExperience(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 flex-shrink-0 ${idx === currentIndex ? "w-8 bg-accent shadow-[0_0_8px_rgba(251,191,36,0.6)]" : "w-2.5 bg-foreground/20 hover:bg-foreground/40"}`}
                    aria-label={`Go to video ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Next Button (Desktop Only) */}
              <button 
                onClick={nextExperience} 
                className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-surface border border-border text-foreground hover:bg-accent hover:border-accent hover:text-black transition-all duration-300 shadow-sm"
                aria-label="Next video"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right: Section Header */}
          <div className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-left">
            <SectionHeading 
              title="YogaJam Channel"
              subtitle="Move Better. Live More."
              align="left"
              className="!mb-0"
            />
            <p className="hidden md:block mt-6 text-foreground-secondary text-base md:text-lg leading-relaxed max-w-lg mx-auto md:mx-0">
              Discover the benefits of yoga, wellness, and movement through our Jams. Get inspired, learn something new, and explore a lifestyle that brings people together.
            </p>
          </div>

        </div>
      </Container>
    </section>
  );
}
