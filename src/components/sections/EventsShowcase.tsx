import * as React from "react";
// removed Image import
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
// removed Button import
import { EventCard } from "@/components/ui/EventCard";
import { createClient } from "@/utils/supabase/server";
import { NewsletterInlineForm } from "@/components/ui/NewsletterInlineForm";

export async function EventsShowcase() {
  const supabase = await createClient()
  
  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('*')

  // Sort by date ascending (earliest first)
  const sortedEvents = (upcomingEvents || []).sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  }).slice(0, 4);

  const hasEvents = sortedEvents && sortedEvents.length > 0;

  return (
    <section className="py-12 md:py-16 relative z-10">
      {/* Foolproof gradient transition using explicit hex codes to avoid CSS variable parsing issues */}
      <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-transparent to-[#0B0D0C] -z-10 pointer-events-none" />
      <div className="absolute top-[150px] bottom-0 left-0 w-full bg-[#0B0D0C] -z-10 pointer-events-none" />
      <Container>
        <div className="flex flex-row justify-between items-end mb-6 md:mb-10 gap-4">
          <SectionHeading title="Upcoming Events" align="left" />
          {hasEvents && (
            <Link
              href="/events"
              className="inline-flex shrink-0 group items-center gap-1.5 md:gap-2 text-foreground-secondary hover:text-accent-warm transition-colors text-sm md:text-base font-medium mb-1 md:mb-0"
            >
              <span>View all</span>
              <svg className="w-3 h-3 md:w-4 md:h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          )}
        </div>

        {hasEvents ? (
          <div className="flex md:grid overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none gap-4 md:gap-6 pb-6 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 md:grid-cols-2 xl:grid-cols-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {sortedEvents?.map((event) => (
              <div key={event.id} className="w-[40vw] sm:w-[30vw] snap-center shrink-0 md:w-auto md:min-w-0">
                <EventCard
                  href={`/events/${event.id}`}
                  imageSrc={event.image}
                  badgeText={event.date}
                  title={event.title}
                  detail1Icon={<svg className="w-4 h-4 text-accent-dark flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  detail1Text={event.price || event.time}
                  detail2Icon={<svg className="w-4 h-4 text-accent-dark flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                  detail2Text={event.location}
                  previewDesc={event.preview_desc}
                  previewHighlight={event.preview_highlight}
                  actionText="Reserve"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-white/10 rounded-3xl bg-surface/30 backdrop-blur-sm w-full mx-auto shadow-2xl">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_30px_rgba(200,232,107,0.1)]">
              <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-heading text-white mb-3 tracking-tight">We&apos;re brewing something special</h3>
            <p className="text-foreground-secondary mb-8 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
              Our next set of immersive wellness experiences are currently being curated. Subscribe to our newsletter to be the first to know when tickets drop!
            </p>
            <div className="w-full">
              <NewsletterInlineForm />
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
