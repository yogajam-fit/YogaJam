import { Hero } from "@/components/sections/Hero";
import { EventNavigationCards } from "@/components/sections/EventNavigationCards";
import { AboutSection } from "@/components/sections/AboutSection";

import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { HomeGallerySection } from "@/components/sections/HomeGallerySection";

import { createClient } from '@/utils/supabase/server';
import { heroEvergreenData, heroFallbackData } from '@/content/hero';
import { personalizedEventsData } from '@/content/personalized-events';
import { journals } from '@/content/journals';
import { toTitleCase } from '@/lib/utils';
import { JsonLd } from "@/components/seo/JsonLd";

export default async function Home() {
  const supabase = await createClient();
  const { data: dbEventsRaw } = await supabase
    .from('events')
    .select('*')
    .limit(100);

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const nowTime = now.getTime();

  // Helper to format a DB event to a Hero Item
  const formatEventToHeroItem = (evt: any, isPast: boolean = false) => {
    let formattedDate = isPast ? "Past Event" : "Upcoming Event";
    if (evt.date) {
      const dateObj = new Date(evt.date);
      formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    const venueStr = toTitleCase(evt.city || '');
    const fullTitle = evt.title || "YogaJam Event";
    const titleParts = fullTitle.split(" ");
    const firstWord = titleParts[0];
    const restWords = titleParts.slice(1).join(" ");

    return {
      id: `db-${evt.id}`,
      eventId: evt.id,
      isPast: isPast,
      title: firstWord,
      subtitle: restWords,
      duration: formattedDate !== "Upcoming Event" && formattedDate !== "Past Event" ? formattedDate : evt.time || "N/A",
      level: "All levels",
      venue: venueStr || "Location TBD",
      desc: evt.preview_desc || "Join us for an amazing event.",
      image: evt.image,
      image_mobile: evt.image_mobile || evt.image,
      video: evt.video || undefined,
      video_mobile: evt.video_mobile || undefined,
      link: `/events/${evt.id}` // Dynamic link to the event detail page
    };
  };

  // 1. Get the most recent past event for the 1st card
  const pastEvents = (dbEventsRaw || [])
    .map(evt => ({ ...evt, parsedDate: new Date(evt.date).getTime() }))
    .filter(evt => !isNaN(evt.parsedDate) && evt.parsedDate < nowTime)
    .sort((a, b) => b.parsedDate - a.parsedDate);
  
  const mostRecentPastEvent = pastEvents.length > 0 ? formatEventToHeroItem(pastEvents[0], true) : heroFallbackData[0];

  // 2. Get upcoming event (if any)
  const upcomingEvents = (dbEventsRaw || [])
    .map(evt => ({ ...evt, parsedDate: new Date(evt.date).getTime() }))
    .filter(evt => !isNaN(evt.parsedDate) && evt.parsedDate >= nowTime)
    .sort((a, b) => a.parsedDate - b.parsedDate);
  
  const upcomingEventItem = upcomingEvents.length > 0 ? formatEventToHeroItem(upcomingEvents[0], false) : heroEvergreenData[1]; // "Next Stop" fallback

  // 3. Prepare random journal/PE for 8th slot
  const randomPEs = [...personalizedEventsData].sort(() => 0.5 - Math.random()).map(item => {
    const titleParts = item.title.split(" ");
    return {
      id: `fallback-pe-${item.id}`,
      title: titleParts[0],
      subtitle: titleParts.slice(1).join(" "),
      duration: item.duration || "Custom",
      level: item.label,
      venue: item.location || "Personalized Event",
      desc: item.previewDesc,
      image: item.image,
      image_mobile: (item as any).image_mobile || item.image,
      link: `/personalized-events/${item.id}`
    };
  });

  const randomJournals = [...journals].sort(() => 0.5 - Math.random()).map(item => {
    const titleParts = item.title.split(" ");
    return {
      id: `fallback-journal-${item.id}`,
      title: titleParts.length > 1 ? titleParts[0] : item.category,
      subtitle: titleParts.length > 1 ? titleParts.slice(1).join(" ") : item.title,
      duration: "Read",
      level: item.category,
      venue: "Journal",
      desc: item.excerpt,
      image: item.image,
      link: `/journals/${item.id}`
    };
  });

  const random8thCard = Math.random() > 0.5 ? randomPEs[0] : randomJournals[0];

  // 4. Construct the exact 8 cards as requested:
  const heroItems = [
    mostRecentPastEvent,                    // 1st
    upcomingEventItem,                      // 2nd
    heroEvergreenData[4],                   // 3rd: Testimonial
    heroEvergreenData[0],                   // 4th: What We Are
    heroEvergreenData[2],                   // 5th: Plan Your Event
    heroEvergreenData[5],                   // 6th: YogaJam Channel
    heroEvergreenData[3],                   // 7th: About Journal (Read. Feel.)
    random8thCard,                          // 8th: Random journal/PE
  ];

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "YogaJam",
    "url": "https://yogajam.fit",
    "logo": "https://yogajam.fit/icon.png",
    "description": "Where Life Feels Alive. Immerse yourself in YogaJam's signature cinematic wellness experiences in Bengaluru.",
    "sameAs": [
      "https://www.instagram.com/yogajam.fit/" // Add real social links if available
    ]
  };

  return (
    <main className="flex-1 flex flex-col">
      <JsonLd data={organizationSchema} />
      <Hero items={heroItems} />
      <div className="md:hidden w-[85%] mx-auto h-px bg-gradient-to-r from-transparent via-accent-warm/50 to-transparent" />
      <EventNavigationCards />
      <div className="md:hidden w-[85%] mx-auto h-px bg-gradient-to-r from-transparent via-accent-warm/50 to-transparent" />
      <AboutSection />
      <div className="md:hidden w-[85%] mx-auto h-px bg-gradient-to-r from-transparent via-accent-warm/50 to-transparent" />

      <ExperienceSection />
      <div className="md:hidden w-[85%] mx-auto h-px bg-gradient-to-r from-transparent via-accent-warm/50 to-transparent" />
      <ReviewsSection />
      <HomeGallerySection />
    </main>
  );
}
