import { Hero } from "@/components/sections/Hero";
import { EventsShowcase } from "@/components/sections/EventsShowcase";
import { AboutSection } from "@/components/sections/AboutSection";
import { PersonalizedEventsSection } from "@/components/sections/PersonalizedEventsSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { TeamSection } from "@/components/sections/TeamSection";

import { createClient } from '@/utils/supabase/server';
import { heroPreviewData } from '@/content/hero';
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

  const heroItems = [...heroPreviewData];
  
  if (dbEvents.length > 0) {
    // Interleave at 1st(0), 3rd(2), 5th(4), 7th(6)
    const indices = [0, 2, 4, 6];
    dbEvents.forEach((evt, i) => {
      if (i < indices.length) {
        const idx = indices[i];
        
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

        heroItems[idx] = {
          id: `db-${evt.id}`,
          title: firstWord,
          subtitle: restWords,
          duration: formattedDate !== "Upcoming Event" ? formattedDate : evt.time || "N/A",
          level: "All levels",
          venue: venueStr || "Location TBD",
          desc: evt.preview_desc || "Join us for an amazing upcoming event.",
          image: evt.image || heroPreviewData[idx].image,
          video: evt.video || undefined
        };
      }
    });
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
