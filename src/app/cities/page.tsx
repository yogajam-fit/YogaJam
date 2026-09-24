import { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { activeCities, upcomingCities } from "@/content/cities";
import { createClient } from "@/utils/supabase/server";
import { WaitlistModal } from "@/components/ui/WaitlistModal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EventCard } from "@/components/ui/EventCard";

export const metadata: Metadata = {
  title: "Cities | YogaJam",
  description: "Find YogaJam events in your city.",
};

export default async function CitiesPage() {
  const supabase = await createClient();
  const { data: dbEvents } = await supabase.from('events').select('city, date');
  const events = dbEvents || [];

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return (
    <main className="flex flex-1 flex-col pt-24 md:pt-32 pb-16 md:pb-24 bg-background">
      <Container className="flex flex-col gap-16 md:gap-20">
        
        {/* Active Cities */}
        <section className="flex flex-col gap-6 md:gap-10">
          <div className="flex items-center justify-between">
            <SectionHeading title="Current Cities" align="left" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
            {activeCities.map((city, index) => {
              const activeCount = events.filter(e => 
                e.city.toLowerCase() === city.name.toLowerCase() && 
                e.date && 
                new Date(e.date) >= now
              ).length;

              return (
                <div key={city.id} className="animate-in fade-in zoom-in-95" style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}>
                  <EventCard
                    href={`/cities/${city.id}`}
                    image={city.image}
                    title={city.name}
                    previewDesc={city.description}
                    actionText="Explore City"
                    badgeText={activeCount > 0 ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        {activeCount} Active Event{activeCount !== 1 ? 's' : ''}
                      </>
                    ) : undefined}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* Upcoming Cities */}
        <section className="flex flex-col gap-6 md:gap-10">
          <div className="flex flex-col gap-2">
            <SectionHeading 
              title="Coming Soon" 
              align="left"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
            {upcomingCities.map((city, index) => (
              <div key={city.id} className="animate-in fade-in zoom-in-95" style={{ animationDelay: `${(activeCities.length + index) * 150}ms`, animationFillMode: 'both' }}>
                <EventCard
                  href={`/cities/${city.id}`}
                  image={city.image}
                  title={city.name}
                  previewDesc={city.description}
                  actionText="Explore City"
                  badgeText="Coming Soon"
                  containerClassName="border-dashed hover:border-border grayscale hover:grayscale-0 !bg-[#050505]/50"
                />
              </div>
            ))}
          </div>
        </section>

      </Container>
    </main>
  );
}
