"use client";

import { Container } from "@/components/ui/Container";
import { useState, useRef, useEffect } from "react";
import { ReviewModal } from "@/components/ui/ReviewModal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { videoReviewsData, textReviewsData } from "@/content/reviews";

const VIDEOS = videoReviewsData.map(v => ({ ...v, type: 'video' }));
const TEXTS = textReviewsData.map(t => ({ ...t, type: 'text' }));

function UnifiedReviewSlot({ 
  initialIndex, 
  slotId, 
  delay = 0,
  data,
  step
}: { 
  initialIndex: number;
  slotId: string;
  delay?: number;
  data: any[];
  step: number;
}) {
  const [idx, setIdx] = useState(initialIndex);
  const [opacity, setOpacity] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isFirstRun = useRef(true);
  
  // Safe modulo to handle any array length
  const currentReview = data.length > 0 ? data[idx % data.length] : null;
  
  useEffect(() => {
    const handleGlobalMute = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.source !== slotId) {
        setIsMuted(true);
        if (videoRef.current) videoRef.current.muted = true;
      }
    };
    window.addEventListener("muteOtherVideos", handleGlobalMute);
    return () => window.removeEventListener("muteOtherVideos", handleGlobalMute);
  }, [slotId]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const newMutedState = !videoRef.current.muted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      if (!newMutedState) {
        videoRef.current.currentTime = 0;
        window.dispatchEvent(new CustomEvent("muteOtherVideos", { detail: { source: slotId } }));
      }
    }
  };

  const cycleNext = () => {
    setOpacity(0);
    setTimeout(() => {
      setIdx(prev => (prev + step) % data.length);
      setOpacity(1);
    }, 1000);
  };

  useEffect(() => {
    if (!currentReview || currentReview.type === 'video') return;
    
    let timer: NodeJS.Timeout;
    if (isFirstRun.current) {
      timer = setTimeout(cycleNext, 15000 + delay);
      isFirstRun.current = false;
    } else {
      timer = setTimeout(cycleNext, 15000);
    }
    return () => clearTimeout(timer);
  }, [currentReview, delay]);

  if (!currentReview) return null;

  if (currentReview.type === 'video') {
    return (
      <div className="col-span-1 aspect-[4/3] w-full rounded-2xl overflow-hidden relative bg-surface border border-border">
        <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${opacity ? 'opacity-100' : 'opacity-0'}`}>
          <video
            key={currentReview.id}
            ref={videoRef}
            autoPlay
            muted={isMuted}
            playsInline
            onEnded={cycleNext}
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          >
            <source src={currentReview.src} type="video/mp4" />
          </video>
        </div>

        <button
          onClick={toggleMute}
          className="absolute bottom-2 right-2 md:bottom-4 md:right-4 z-30 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 backdrop-blur-md border border-border flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 hover:scale-110 hover:border-border transition-all duration-300 shadow-lg"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? (
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
      </div>
    );
  }

  // Text layout
  return (
    <div className="col-span-1 aspect-[4/3] w-full rounded-2xl bg-surface border border-border p-5 sm:p-6 md:p-8 flex flex-col relative overflow-hidden group hover:bg-surface/60 transition-colors duration-500">
      <svg className="absolute -top-2 -left-2 w-16 h-16 sm:w-20 sm:h-20 text-white/[0.03] group-hover:text-white/[0.05] rotate-180 transform group-hover:scale-110 transition-all duration-500 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.017 21v-7.391c0-5.714 4.025-8.609 9.983-9.609v3.315c-3.13 0-5.11 1.776-5.836 4.391h5.836v9.294h-10.033zm-14.017 0v-7.391c0-5.714 4.025-8.609 9.983-9.609v3.315c-3.13 0-5.11 1.776-5.836 4.391h5.836v9.294h-10.033z" />
      </svg>
      <div className={`h-full w-full relative z-10 transition-opacity duration-1000 ease-in-out ${opacity ? 'opacity-100' : 'opacity-0'}`}>
        <div className="h-full overflow-y-auto custom-scrollbar pr-2 flex flex-col">
          <div className="m-auto w-full py-2 flex flex-col">
            <p className="text-foreground-secondary text-xs sm:text-sm lg:text-base italic leading-relaxed order-2 md:order-1">
              {currentReview.text}
            </p>
            <div className="flex items-center gap-2 order-1 md:order-2 mb-3 md:mb-0 md:mt-4 lg:mt-6">
              <div className="h-[1px] w-4 bg-accent/50 shrink-0" />
              <p className="text-foreground text-[10px] sm:text-xs font-bold tracking-wider uppercase truncate">
                {currentReview.author}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReviewsSection() {
  const videoCount = VIDEOS.length;
  const videoSlots = Math.min(videoCount, 2);
  const textSlots = 4 - videoSlots;

  const slot1IsVideo = videoSlots >= 1;
  const slot4IsVideo = videoSlots >= 2;

  // Assign sequential initial indices for text and video
  let nextTextIdx = 0;
  
  const slot1Data = slot1IsVideo ? VIDEOS : TEXTS;
  const slot1Step = slot1IsVideo ? videoSlots : textSlots;
  const slot1Init = slot1IsVideo ? 0 : nextTextIdx++;

  const slot2Data = TEXTS;
  const slot2Step = textSlots;
  const slot2Init = nextTextIdx++;

  const slot3Data = TEXTS;
  const slot3Step = textSlots;
  const slot3Init = nextTextIdx++;

  const slot4Data = slot4IsVideo ? VIDEOS : TEXTS;
  const slot4Step = slot4IsVideo ? videoSlots : textSlots;
  const slot4Init = slot4IsVideo ? 1 : nextTextIdx++;
  
  return (
    <section className="py-12 md:py-16 relative z-10 bg-background">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 items-center">

          {/* Top Row: Title & Stats */}
          <div className="flex flex-col gap-6 col-span-2 md:col-span-2 lg:col-span-1">
            <SectionHeading 
              title="What our happy jammers say"
              align="left"
            />
            <div className="flex items-center gap-6 mt-2">
              <div>
                <p className="text-3xl font-bold text-foreground font-heading">2+</p>
                <p className="text-xs text-foreground-secondary uppercase tracking-widest mt-1">Events</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground font-heading">100+</p>
                <p className="text-xs text-foreground-secondary uppercase tracking-widest mt-1">Jammers & counting</p>
              </div>
            </div>
          </div>

          <UnifiedReviewSlot 
            initialIndex={slot1Init} 
            slotId="slot1" 
            delay={0} 
            data={slot1Data} 
            step={slot1Step} 
          />
          <UnifiedReviewSlot 
            initialIndex={slot2Init} 
            slotId="slot2" 
            delay={3750} 
            data={slot2Data} 
            step={slot2Step} 
          />
          <UnifiedReviewSlot 
            initialIndex={slot3Init} 
            slotId="slot3" 
            delay={7500} 
            data={slot3Data} 
            step={slot3Step} 
          />
          <UnifiedReviewSlot 
            initialIndex={slot4Init} 
            slotId="slot4" 
            delay={11250} 
            data={slot4Data} 
            step={slot4Step} 
          />

          {/* Bottom Row: Call to Action (Share Experience) */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1 h-full w-full">
            <ReviewModal>
              <div className="h-full w-full aspect-auto lg:aspect-[4/3] rounded-2xl bg-surface/40 hover:bg-surface/80 transition-colors duration-500 border border-border p-6 md:p-8 flex flex-col justify-center relative overflow-hidden group cursor-pointer min-h-[200px]">
                {/* Background Decorative Icon */}
                <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none">
                  <svg className="w-48 h-48 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.714 4.025-8.609 9.983-9.609v3.315c-3.13 0-5.11 1.776-5.836 4.391h5.836v9.294h-10.033zm-14.017 0v-7.391c0-5.714 4.025-8.609 9.983-9.609v3.315c-3.13 0-5.11 1.776-5.836 4.391h5.836v9.294h-10.033z" />
                  </svg>
                </div>

                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold font-heading text-foreground mb-2 md:mb-3 relative z-10">
                  Got a story?
                </h3>
                <p className="text-foreground-secondary text-xs md:text-sm leading-relaxed mb-6 md:mb-8 relative z-10">
                  We&apos;d love to hear how YogaJam moved you. Share your own experience and join our growing community of happy clients.
                </p>

                <div className="flex items-center gap-2 md:gap-3 text-accent font-medium text-xs md:text-sm tracking-wide uppercase relative z-10 w-fit border-b border-accent/30 pb-1 group-hover:border-accent transition-colors">
                  Share your experience
                  <svg className="w-3 h-3 md:w-4 md:h-4 transition-transform duration-300 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </ReviewModal>
          </div>

        </div>
      </Container>
    </section>
  );
}
