import { Hero } from "@/components/sections/Hero";
import { EventsShowcase } from "@/components/sections/EventsShowcase";
import { AboutSection } from "@/components/sections/AboutSection";
import { PersonalizedEventsSection } from "@/components/sections/PersonalizedEventsSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { TeamSection } from "@/components/sections/TeamSection";

import { createClient } from '@/utils/supabase/server';
import { heroEvergreenData } from '@/content/hero';
import { personalizedEventsData } from '@/content/personalized-events';
import { journals } from '@/content/journals';
import { toTitleCase } from '@/lib/utils';

export default async function Home() {
  const supabase = await createClient();
  const { data: dbEventsRaw } = await supabase
    .from('events')
    .select('*')
    .limit(100);

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const nowTime = now.getTime();

  // Parse dates and sort chronologically in memory (since date is stored as "MMM DD, YYYY" text)
  const dbEvents = (dbEventsRaw || [])
    .map(evt => ({ ...evt, parsedDate: new Date(evt.date).getTime() }))
    .filter(evt => !isNaN(evt.parsedDate) && evt.parsedDate >= nowTime) // Ensure valid dates and not in the past
    .sort((a, b) => a.parsedDate - b.parsedDate)
    .slice(0, 4);

  // Prepare Hero Section Content (8 items total)
  // We use 4 dynamic event slots (filled by DB events, falling back to static fallbacks)
  // We interleave these with 4 evergreen static items that are always shown
  const MAX_DYNAMIC_SLOTS = 4;
  const dynamicEventItems: any[] = [];

  // 1. Fill dynamic slots with DB events first
  dbEvents.slice(0, MAX_DYNAMIC_SLOTS).forEach((evt, i) => {
    // Format date as subtitle (e.g. "Oct 12, 2026")
    let formattedDate = "Upcoming Event";
    if (evt.date) {
      const dateObj = new Date(evt.date);
      formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    const venueStr = toTitleCase(evt.city || '');
    const fullTitle = evt.title || "YogaJam Event";
    const titleParts = fullTitle.split(" ");
    const firstWord = titleParts[0];
    const restWords = titleParts.slice(1).join(" ");

    dynamicEventItems.push({
      id: `db-${evt.id}`,
      eventId: evt.id,
      title: firstWord,
      subtitle: restWords,
      duration: formattedDate !== "Upcoming Event" ? formattedDate : evt.time || "N/A",
      level: "All levels",
      venue: venueStr || "Location TBD",
      desc: evt.preview_desc || "Join us for an amazing upcoming event.",
      image: evt.image,
      image_mobile: evt.image_mobile || evt.image,
      video: evt.video || undefined,
      video_mobile: evt.video_mobile || undefined,
      link: `/events/${evt.id}` // Dynamic link to the event detail page
    });
  });

  // 2. Fill the remaining dynamic slots with static fallback data
  const staticItemsNeeded = MAX_DYNAMIC_SLOTS - dynamicEventItems.length;
  if (staticItemsNeeded > 0) {
    const randomPEs = [...personalizedEventsData].sort(() => 0.5 - Math.random()).slice(0, 2).map(item => {
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

    const randomJournals = [...journals].sort(() => 0.5 - Math.random()).slice(0, 2).map(item => {
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

    const allFallbacks = [...randomPEs, ...randomJournals].sort(() => 0.5 - Math.random());

    for (let i = 0; i < staticItemsNeeded; i++) {
      dynamicEventItems.push(allFallbacks[i]);
    }
  }

  // 3. Interleave evergreen static content with dynamic/fallback events
  // Result: [Evergreen 1, Event 1, Evergreen 2, Event 2, ...]
  const heroItems = [];
  for (let i = 0; i < 4; i++) {
    heroItems.push(heroEvergreenData[i]);
    heroItems.push(dynamicEventItems[i]);
  }

  return (
    <main className="flex-1 flex flex-col">
      <Hero items={heroItems} />
      <EventsShowcase />
      <AboutSection />
      <PersonalizedEventsSection />
      <ExperienceSection />
      <ReviewsSection />
      <TeamSection />
    </main>
  );
}
