"use client";

// removed Image import
import { Container } from "@/components/ui/Container";
import { useState, useRef, useEffect } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { experiencesData as experiences } from "@/content/experiences";

export function ExperienceSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === currentIndex) {
        video.currentTime = 0;
        video.play().catch(e => console.log("Playback prevented:", e));
      } else {
        video.pause();
      }
    });

    // Auto-scroll mobile container when currentIndex changes (e.g. video ends)
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      const container = document.getElementById('experience-scroll-container');
      if (container && container.clientWidth > 0) {
        const itemWidth = container.clientWidth + 16; // Account for gap-4
        const currentScrollIndex = Math.round(container.scrollLeft / itemWidth);
        if (currentScrollIndex !== currentIndex) {
           container.scrollTo({ left: currentIndex * itemWidth, behavior: 'smooth' });
        }
      }
    }
  }, [currentIndex]);

  const activeExperience = experiences[currentIndex];

  useEffect(() => {
    const handleGlobalMute = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.source !== "experience") {
        setIsMuted(true);
        // Force the active video to mute immediately
        const activeVideo = videoRefs.current[currentIndex];
        if (activeVideo) {
          activeVideo.muted = true;
        }
      }
    };
    window.addEventListener("muteOtherVideos", handleGlobalMute);
    return () => window.removeEventListener("muteOtherVideos", handleGlobalMute);
  }, [currentIndex]);

  const toggleMute = () => {
    const activeVideo = videoRefs.current[currentIndex];
    if (activeVideo) {
      const newMuted = !activeVideo.muted;
      activeVideo.muted = newMuted;
      setIsMuted(newMuted);

      if (!newMuted) {
        window.dispatchEvent(new CustomEvent("muteOtherVideos", { detail: { source: "experience" } }));
      }
    }
  };

  const nextExperience = () => {
    setCurrentIndex((prev) => (prev + 1) % experiences.length);
  };

  const prevExperience = () => {
    setCurrentIndex((prev) => (prev - 1 + experiences.length) % experiences.length);
  };

  return (
    <section className="py-12 md:py-16 relative z-10 bg-background">
      <Container>
        {/* Section Header */}
        <SectionHeading 
          title="Moments that moved us."
          subtitle="From sunrise flows to high-energy nights — here's what happens when people come together."
          align="left"
          className="mb-10 max-w-3xl"
        />

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-20 items-stretch">
          {/* Left: Video Deck */}
          <div 
            id="experience-scroll-container"
            className="w-full lg:w-1/2 relative flex lg:block gap-4 lg:gap-0 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden aspect-video lg:mb-0 lg:mr-8"
            onScroll={(e) => {
              if (typeof window !== 'undefined' && window.innerWidth >= 1024) return;
              const container = e.currentTarget;
              
              if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
              }
              
              scrollTimeout.current = setTimeout(() => {
                const itemWidth = container.clientWidth + 16; 
                const index = Math.round(container.scrollLeft / itemWidth);
                if (index !== currentIndex) {
                  setCurrentIndex(index);
                }
              }, 150);
            }}
          >
            {experiences.map((exp, idx) => {
              const diff = (idx - currentIndex + experiences.length) % experiences.length;

              let desktopClasses = "";
              if (diff === 0) {
                desktopClasses = "lg:z-20 lg:translate-x-0 lg:translate-y-0 lg:opacity-100 lg:shadow-2xl";
              } else if (diff === 1) {
                desktopClasses = "lg:z-10 lg:translate-x-3 lg:translate-y-3 lg:opacity-60 lg:brightness-50";
              } else {
                desktopClasses = "lg:z-0 lg:opacity-0 lg:translate-x-0 lg:translate-y-0 lg:pointer-events-none";
              }

              return (
                <div
                  key={exp.id}
                  className={`w-full shrink-0 snap-center relative lg:absolute lg:top-0 lg:left-0 lg:w-full lg:h-full bg-surface overflow-hidden rounded-2xl transition-all duration-700 ease-in-out lg:cursor-pointer aspect-video lg:aspect-auto ${desktopClasses}`}
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.innerWidth >= 1024 && diff !== 0) nextExperience();
                  }}
                >
                  <video
                    ref={(el) => { videoRefs.current[idx] = el; }}
                    muted={diff !== 0 || isMuted}
                    playsInline
                    onEnded={nextExperience}
                    className="absolute inset-0 w-full h-full object-contain bg-black/40"
                    poster={exp.poster}
                  >
                    <source src={exp.videoSrc} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>

                  {/* Show mute button only on active slide on desktop, but always on mobile if it's the current index */}
                  {(diff === 0 || (typeof window !== 'undefined' && window.innerWidth < 1024 && idx === currentIndex)) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMute();
                      }}
                      className="absolute bottom-4 right-4 z-30 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-border flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 hover:scale-110 hover:border-border transition-all duration-300 shadow-lg"
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

          {/* Mobile Indicator */}
          <div className="flex lg:hidden items-center justify-center gap-3 w-full mt-6 mb-8">
            {experiences.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  const container = document.getElementById('experience-scroll-container');
                  if (container) {
                    const itemWidth = container.clientWidth + 16;
                    container.scrollTo({ left: idx * itemWidth, behavior: 'smooth' });
                  }
                }}
                className={`h-2.5 rounded-full transition-all duration-300 flex-shrink-0 ${idx === currentIndex ? "w-8 bg-accent shadow-[0_0_8px_rgba(251,191,36,0.6)]" : "w-2.5 bg-foreground/20 hover:bg-foreground/40"}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Right: Text Content */}
          <div className="w-full lg:w-1/2 flex flex-col justify-between">
            <div className="flex flex-col justify-start min-h-[200px] lg:min-h-[160px]">
              <div key={activeExperience.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h3 className="text-2xl md:text-4xl font-bold text-foreground font-heading mb-4 md:mb-6">
                  {activeExperience.title}
                </h3>
                <p className="text-foreground-secondary text-base md:text-lg leading-relaxed">
                  {activeExperience.description}
                </p>
              </div>
            </div>

            {/* Navigation Controls (Desktop Only) */}
            <div className="hidden lg:flex items-center gap-5 mt-8">
              <button
                onClick={prevExperience}
                className="w-12 h-12 rounded-full bg-[#111111] border border-border flex items-center justify-center text-white/80 hover:text-black hover:bg-accent hover:border-accent transition-all duration-300 shadow-md flex-shrink-0"
                aria-label="Previous experience"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Pagination Dots */}
              <div className="flex items-center justify-center gap-3 w-[80px]">
                {experiences.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 flex-shrink-0 ${idx === currentIndex ? "w-8 bg-accent shadow-[0_0_8px_rgba(251,191,36,0.6)]" : "w-2.5 bg-foreground/20 hover:bg-foreground/40"}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextExperience}
                className="w-12 h-12 rounded-full bg-[#111111] border border-border flex items-center justify-center text-white/80 hover:text-black hover:bg-accent hover:border-accent transition-all duration-300 shadow-md flex-shrink-0"
                aria-label="Next experience"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
