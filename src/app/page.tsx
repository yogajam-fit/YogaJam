import { Hero } from "@/components/sections/Hero";
import { EventsShowcase } from "@/components/sections/EventsShowcase";
import { AboutSection } from "@/components/sections/AboutSection";
import { PersonalizedEventsSection } from "@/components/sections/PersonalizedEventsSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { TeamSection } from "@/components/sections/TeamSection";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      <Hero />
      <EventsShowcase />
      <AboutSection />
      <PersonalizedEventsSection />
      <ExperienceSection />
      <ReviewsSection />
      <TeamSection />
    </main>
  );
}
