"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EventCard } from "@/components/ui/EventCard";
import type { EventRecord } from "@/components/admin/EventsTable";
import { NewsletterInlineForm } from "@/components/ui/NewsletterInlineForm";
import { formatPrice } from "@/lib/utils";

import { useSearchParams } from 'next/navigation';

function EventsClientContent({ events }: { events: EventRecord[] }) {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const showUpcoming = tab !== 'past';
  const showPast = tab !== 'upcoming';
  const [activeCity, setActiveCity] = React.useState("All");
  
  // Extract unique cities from the city column
  const cities = React.useMemo(() => {
    const extracted = events.map(e => e.city || e.location.split(',').pop()?.trim() || "");
    return ["All", ...Array.from(new Set(extracted)).filter(Boolean)];
  }, [events]);

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Start of today

  const upcomingEvents = React.useMemo(() => {
    return events.filter(e => new Date(e.date) >= now);
  }, [events]);

  const pastEvents = React.useMemo(() => {
    return events
      .filter(e => new Date(e.date) < now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [events]);

  const filteredUpcoming = activeCity === "All"
    ? upcomingEvents
    : upcomingEvents.filter(e => (e.city || e.location).endsWith(activeCity));

  const filteredPast = activeCity === "All"
    ? pastEvents
    : pastEvents.filter(e => (e.city || e.location).endsWith(activeCity));

  return (
    <main className="flex-1 pt-24 md:pt-32 pb-16 md:pb-24 bg-background">
      <Container>
        {/* Page Header */}
        {showUpcoming && showPast && (
          <div className="max-w-2xl mb-4 md:mb-6">
            <SectionHeading 
              title="Upcoming Events"
              align="left"
            />
          </div>
        )}



        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-border rounded-3xl bg-surface/30 backdrop-blur-sm w-full mx-auto shadow-2xl mt-8">
            <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mb-6 border border-border shadow-[0_0_30px_rgba(200,232,107,0.1)]">
              <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-3 tracking-tight">We're brewing something special</h3>
            <p className="text-foreground-secondary mb-8 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
              Our next set of immersive wellness experiences are currently being curated. Subscribe to our newsletter to be the first to know when tickets drop!
            </p>
            <div className="w-full">
              <NewsletterInlineForm />
            </div>
          </div>
        ) : filteredUpcoming.length === 0 && filteredPast.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-border rounded-3xl bg-surface/30 backdrop-blur-sm w-full mx-auto shadow-2xl mt-8">
            <h3 className="text-xl md:text-2xl font-bold font-heading text-foreground mb-3 tracking-tight">No events found for {activeCity}</h3>
            <p className="text-foreground-secondary mb-8 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
              We don't have any events in this location right now. Try selecting another city or subscribe to be notified when we bring an experience near you!
            </p>
            <div className="w-full">
              <NewsletterInlineForm />
            </div>
          </div>
        ) : (
          <div className="space-y-10 md:space-y-16">
            {showUpcoming && (filteredUpcoming.length > 0 ? (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
                  {filteredUpcoming.map((event) => (
                    <EventCard
                      key={event.id}
                      href={`/events/${event.id}`}
                      image={event.image}
                      image_mobile={event.image_mobile}
                      badgeText={event.date}
                      title={event.title}
                      detail1Icon={
                        event.price && event.price !== "0" && event.price !== "Free" && event.price !== "" ? (
                          <svg className="w-4 h-4 text-accent-dark flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                        ) : (
                          <svg className="w-4 h-4 text-accent-dark flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )
                      }
                      detail1Text={event.price && event.price !== "0" && event.price !== "Free" && event.price !== "" ? formatPrice(event.price) : event.time}
                      detail2Icon={<svg className="w-4 h-4 text-accent-dark flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                      detail2Text={event.city}
                      previewDesc={event.preview_desc}
                      previewHighlight={event.preview_highlight}
                      actionText="Reserve"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-border rounded-3xl bg-surface/30 backdrop-blur-sm w-full mx-auto shadow-2xl mt-8">
                <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mb-6 border border-border shadow-[0_0_30px_rgba(200,232,107,0.1)]">
                  <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-3 tracking-tight">We're brewing something special</h3>
                <p className="text-foreground-secondary mb-8 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
                  Our next set of immersive wellness experiences are currently being curated. Subscribe to our newsletter to be the first to know when tickets drop!
                </p>
                <div className="w-full">
                  <NewsletterInlineForm />
                </div>
              </div>
            ))}
            
            {showPast && filteredPast.length > 0 && (
              <div>
                {showUpcoming && (
                  <div className="max-w-2xl mb-4 md:mb-6">
                    <SectionHeading 
                      title="Past Events"
                      align="left"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8 opacity-75">
                  {filteredPast.map((event) => (
                    <EventCard
                      key={event.id}
                      href={`/events/${event.id}`}
                      image={event.image}
                      image_mobile={event.image_mobile}
                      badgeText={event.date}
                      title={event.title}
                      detail2Icon={<svg className="w-4 h-4 text-accent-dark flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                      detail2Text={event.city}
                      previewDesc={event.preview_desc}
                      actionText="View Recap"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Container>
    </main>
  );
}

export function EventsClient({ events }: { events: EventRecord[] }) {
  return (
    <React.Suspense fallback={<div className="flex-1 bg-background" />}>
      <EventsClientContent events={events} />
    </React.Suspense>
  );
}
