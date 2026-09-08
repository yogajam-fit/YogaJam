"use client";

import { Container } from "@/components/ui/Container";
import { useState, useRef, useEffect } from "react";
import { ReviewModal } from "@/components/ui/ReviewModal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { videoReviewsData as VIDEO_REVIEWS, textReviewsData as TEXT_REVIEWS } from "@/content/reviews";

export function ReviewsSection() {
  // Independent queues
  const [vid1Idx, setVid1Idx] = useState(0); // Evens
  const [vid2Idx, setVid2Idx] = useState(1); // Odds
  const [text1Idx, setText1Idx] = useState(0); // Evens
  const [text2Idx, setText2Idx] = useState(1); // Odds

  // Transition states
  const [vid1Opacity, setVid1Opacity] = useState(1);
  const [vid2Opacity, setVid2Opacity] = useState(1);
  const [text1Opacity, setText1Opacity] = useState(1);
  const [text2Opacity, setText2Opacity] = useState(1);

  // Staggered interval for text reviews (15s each, offset by 7.5s)
  useEffect(() => {
    const timer1 = setInterval(() => {
      setText1Opacity(0);
      setTimeout(() => {
        setText1Idx(prev => (prev + 2) % TEXT_REVIEWS.length);
        setText1Opacity(1);
      }, 1000); // 1s fade out before swapping
    }, 15000);

    const timer2 = setTimeout(() => {
      const interval = setInterval(() => {
        setText2Opacity(0);
        setTimeout(() => {
          setText2Idx(prev => (prev + 2) % TEXT_REVIEWS.length);
          setText2Opacity(1);
        }, 1000);
      }, 15000);
      return () => clearInterval(interval);
    }, 7500);

    return () => {
      clearInterval(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const [isMuted1, setIsMuted1] = useState(true);
  const [isMuted2, setIsMuted2] = useState(true);

  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleGlobalMute = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        if (customEvent.detail.source !== "review1") {
          setIsMuted1(true);
          if (video1Ref.current) video1Ref.current.muted = true;
        }
        if (customEvent.detail.source !== "review2") {
          setIsMuted2(true);
          if (video2Ref.current) video2Ref.current.muted = true;
        }
      }
    };
    window.addEventListener("muteOtherVideos", handleGlobalMute);
    return () => window.removeEventListener("muteOtherVideos", handleGlobalMute);
  }, []);

  const toggleMute1 = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (video1Ref.current) {
      const newMutedState = !video1Ref.current.muted;
      video1Ref.current.muted = newMutedState;
      setIsMuted1(newMutedState);

      if (!newMutedState) {
        video1Ref.current.currentTime = 0;
        window.dispatchEvent(new CustomEvent("muteOtherVideos", { detail: { source: "review1" } }));
      }
    }
  };

  const toggleMute2 = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (video2Ref.current) {
      const newMutedState = !video2Ref.current.muted;
      video2Ref.current.muted = newMutedState;
      setIsMuted2(newMutedState);

      if (!newMutedState) {
        video2Ref.current.currentTime = 0;
        window.dispatchEvent(new CustomEvent("muteOtherVideos", { detail: { source: "review2" } }));
      }
    }
  };

  const handleVideo1End = () => {
    setVid1Opacity(0);
    setTimeout(() => {
      setVid1Idx(prev => (prev + 2) % VIDEO_REVIEWS.length);
      setVid1Opacity(1);
    }, 1000);
  };

  const handleVideo2End = () => {
    setVid2Opacity(0);
    setTimeout(() => {
      setVid2Idx(prev => (prev + 2) % VIDEO_REVIEWS.length);
      setVid2Opacity(1);
    }, 1000);
  };

  return (
    <section className="py-12 md:py-16 relative z-10 bg-background">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 items-center">

          {/* Top Row: Title & Stats, Card 1, Card 2 */}
          <div className="flex flex-col gap-6 col-span-2 md:col-span-2 lg:col-span-1">
            <SectionHeading 
              title="What our happy client says"
              align="left"
            />
            <div className="flex items-center gap-6 mt-2">
              <div>
                <p className="text-3xl font-bold text-foreground font-heading">200+</p>
                <p className="text-xs text-foreground-secondary uppercase tracking-widest mt-1">Events</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground font-heading">10000+</p>
                <p className="text-xs text-foreground-secondary uppercase tracking-widest mt-1">Happy clients</p>
              </div>
            </div>
          </div>

          <div className="col-span-1 aspect-[4/3] w-full rounded-2xl overflow-hidden relative bg-surface border border-border">
            <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${vid1Opacity ? 'opacity-100' : 'opacity-0'}`}>
              <video
                key={VIDEO_REVIEWS[vid1Idx].id}
                ref={video1Ref}
                autoPlay
                muted={isMuted1}
                playsInline
                onEnded={handleVideo1End}
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              >
                <source src={VIDEO_REVIEWS[vid1Idx].src} type="video/mp4" />
              </video>
            </div>

            <button
              onClick={toggleMute1}
              className="absolute bottom-2 right-2 md:bottom-4 md:right-4 z-30 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 backdrop-blur-md border border-border flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 hover:scale-110 hover:border-border transition-all duration-300 shadow-lg"
              aria-label={isMuted1 ? "Unmute video" : "Mute video"}
            >
              {isMuted1 ? (
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

          <div className="col-span-1 aspect-[4/3] w-full rounded-2xl bg-surface border border-border p-5 sm:p-6 md:p-8 flex flex-col relative overflow-hidden group hover:bg-surface/60 transition-colors duration-500">
            {/* Decorative Quote */}
            <svg className="absolute -top-2 -left-2 w-16 h-16 sm:w-20 sm:h-20 text-white/[0.03] group-hover:text-white/[0.05] rotate-180 transform group-hover:scale-110 transition-all duration-500 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.714 4.025-8.609 9.983-9.609v3.315c-3.13 0-5.11 1.776-5.836 4.391h5.836v9.294h-10.033zm-14.017 0v-7.391c0-5.714 4.025-8.609 9.983-9.609v3.315c-3.13 0-5.11 1.776-5.836 4.391h5.836v9.294h-10.033z" />
            </svg>

            <div className={`h-full w-full relative z-10 transition-opacity duration-1000 ease-in-out ${text1Opacity ? 'opacity-100' : 'opacity-0'}`}>
              <div className="h-full overflow-y-auto custom-scrollbar pr-2 flex flex-col">
                <div className="m-auto w-full py-2 flex flex-col">
                  <p className="text-foreground-secondary text-xs sm:text-sm lg:text-base italic leading-relaxed order-2 md:order-1">
                    {TEXT_REVIEWS[text1Idx].text}
                  </p>
                  <div className="flex items-center gap-2 order-1 md:order-2 mb-3 md:mb-0 md:mt-4 lg:mt-6">
                    <div className="h-[1px] w-4 bg-accent/50 shrink-0" />
                    <p className="text-foreground text-[10px] sm:text-xs font-bold tracking-wider uppercase truncate">
                      {TEXT_REVIEWS[text1Idx].author}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Card 3, Card 4, Arrows */}
          <div className="col-span-1 aspect-[4/3] w-full rounded-2xl bg-surface border border-border p-5 sm:p-6 md:p-8 flex flex-col relative overflow-hidden group hover:bg-surface/60 transition-colors duration-500">
            {/* Decorative Quote */}
            <svg className="absolute -top-2 -left-2 w-16 h-16 sm:w-20 sm:h-20 text-white/[0.03] group-hover:text-white/[0.05] rotate-180 transform group-hover:scale-110 transition-all duration-500 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.714 4.025-8.609 9.983-9.609v3.315c-3.13 0-5.11 1.776-5.836 4.391h5.836v9.294h-10.033zm-14.017 0v-7.391c0-5.714 4.025-8.609 9.983-9.609v3.315c-3.13 0-5.11 1.776-5.836 4.391h5.836v9.294h-10.033z" />
            </svg>

            <div className={`h-full w-full relative z-10 transition-opacity duration-1000 ease-in-out ${text2Opacity ? 'opacity-100' : 'opacity-0'}`}>
              <div className="h-full overflow-y-auto custom-scrollbar pr-2 flex flex-col">
                <div className="m-auto w-full py-2 flex flex-col">
                  <p className="text-foreground-secondary text-xs sm:text-sm lg:text-base italic leading-relaxed order-2 md:order-1">
                    {TEXT_REVIEWS[text2Idx].text}
                  </p>
                  <div className="flex items-center gap-2 order-1 md:order-2 mb-3 md:mb-0 md:mt-4 lg:mt-6">
                    <div className="h-[1px] w-4 bg-accent/50 shrink-0" />
                    <p className="text-foreground text-[10px] sm:text-xs font-bold tracking-wider uppercase truncate">
                      {TEXT_REVIEWS[text2Idx].author}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1 aspect-[4/3] w-full rounded-2xl overflow-hidden relative bg-surface border border-border">
            <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${vid2Opacity ? 'opacity-100' : 'opacity-0'}`}>
              <video
                key={VIDEO_REVIEWS[vid2Idx].id}
                ref={video2Ref}
                autoPlay
                muted={isMuted2}
                playsInline
                onEnded={handleVideo2End}
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              >
                <source src={VIDEO_REVIEWS[vid2Idx].src} type="video/mp4" />
              </video>
            </div>

            <button
              onClick={toggleMute2}
              className="absolute bottom-2 right-2 md:bottom-4 md:right-4 z-30 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 backdrop-blur-md border border-border flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 hover:scale-110 hover:border-border transition-all duration-300 shadow-lg"
              aria-label={isMuted2 ? "Unmute video" : "Mute video"}
            >
              {isMuted2 ? (
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
