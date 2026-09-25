"use client";

import { Container } from "@/components/ui/Container";
import { useState, useRef, useEffect, useCallback } from "react";
import { ReviewModal } from "@/components/ui/ReviewModal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { createClient } from "@/utils/supabase/client";


function TextReviewSlot({ 
  initialIndex, 
  delay = 0,
  data,
  step
}: { 
  initialIndex: number;
  delay?: number;
  data: any[];
  step: number;
}) {
  const [idx, setIdx] = useState(initialIndex);
  const [opacity, setOpacity] = useState(1);
  const isFirstRun = useRef(true);
  
  // Safe modulo to handle any array length
  const currentReview = data.length > 0 ? data[idx % data.length] : null;

  const cycleNext = useCallback(() => {
    setOpacity(0);
    setTimeout(() => {
      setIdx(prev => (prev + step) % data.length);
      setOpacity(1);
    }, 1000);
  }, [step, data.length]);

  useEffect(() => {
    if (!currentReview) return;
    
    let timer: NodeJS.Timeout;
    if (isFirstRun.current) {
      timer = setTimeout(cycleNext, 15000 + delay);
      isFirstRun.current = false;
    } else {
      timer = setTimeout(cycleNext, 15000);
    }
    return () => clearTimeout(timer);
  }, [currentReview, delay, cycleNext]);

  if (!currentReview) return null;

  return (
    <div className="col-span-1 aspect-[4/5] sm:aspect-square md:aspect-[4/3] min-h-[220px] w-full rounded-2xl bg-surface border border-border p-4 sm:p-5 md:p-8 flex flex-col relative overflow-hidden group hover:bg-surface/60 transition-colors duration-500">
      <svg className="absolute -top-2 -left-2 w-16 h-16 sm:w-20 sm:h-20 text-white/[0.03] group-hover:text-white/[0.05] rotate-180 transform group-hover:scale-110 transition-all duration-500 pointer-events-none" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.017 21v-7.391c0-5.714 4.025-8.609 9.983-9.609v3.315c-3.13 0-5.11 1.776-5.836 4.391h5.836v9.294h-10.033zm-14.017 0v-7.391c0-5.714 4.025-8.609 9.983-9.609v3.315c-3.13 0-5.11 1.776-5.836 4.391h5.836v9.294h-10.033z" />
      </svg>
      <div className={`h-full w-full relative z-10 transition-opacity duration-1000 ease-in-out ${opacity ? 'opacity-100' : 'opacity-0'}`}>
        <div className="h-full overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-1 flex flex-col">
          <div className="m-auto w-full py-1 flex flex-col">
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
  const [dbReviews, setDbReviews] = useState<{author: string, text: string}[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchReviews() {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
        
      if (data && data.length > 0) {
        setDbReviews(data.map(r => ({ author: r.name, text: r.review })));
      }
    }
    fetchReviews();
  }, []);

  const TEXTS = dbReviews;
  const textSlots = 4;
  let nextTextIdx = 0;
  
  if (TEXTS.length === 0) {
    return null; // Or show a loading state / empty state if preferred
  }

  return (
    <section id="reviews" className="py-6 md:py-8 relative z-10 bg-background">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 items-center">

          {/* Top Row: Title & Stats */}
          <div className="flex flex-col gap-2 md:gap-6 col-span-2 md:col-span-2 lg:col-span-1 mb-4 md:mb-0">
            <SectionHeading 
              title="What our happy jammers say"
              align="left"
            />
            <div className="flex items-center gap-6">
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

          <TextReviewSlot 
            initialIndex={nextTextIdx++} 
            delay={0} 
            data={TEXTS} 
            step={textSlots} 
          />
          <TextReviewSlot 
            initialIndex={nextTextIdx++} 
            delay={3750} 
            data={TEXTS} 
            step={textSlots} 
          />
          <TextReviewSlot 
            initialIndex={nextTextIdx++} 
            delay={7500} 
            data={TEXTS} 
            step={textSlots} 
          />
          <TextReviewSlot 
            initialIndex={nextTextIdx++} 
            delay={11250} 
            data={TEXTS} 
            step={textSlots} 
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
