import { TeamSection } from "@/components/sections/TeamSection";

export const metadata = {
  title: "Our Team | YogaJam",
  description: "Meet the people behind YogaJam who make your experience unforgettable.",
};

export default function TeamPage() {
  return (
    <main className="flex-1 flex flex-col pt-24 md:pt-32 pb-16 bg-background">
      <TeamSection />
    </main>
  );
}
