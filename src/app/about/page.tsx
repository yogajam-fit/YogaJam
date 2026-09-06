import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { contactData } from "@/content/contact";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "About Us | YogaJam - Movement, Music & Connection",
  description: "Discover the story behind YogaJam. We blend cinematic wellness experiences, deep house beats, and mindful movement to create unforgettable community gatherings.",
  keywords: "YogaJam, wellness, yoga events, cinematic yoga, deep house yoga, community, fitness",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-24 md:pt-32 pb-16 md:pb-24 bg-background overflow-hidden">
      <Container>
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-20 md:mb-32">
          <SectionHeading 
            title={<>Movement. Music. <span className="text-accent-warm">Connection.</span></>}
            subtitle="We believe that wellness shouldn't be boring. YogaJam was born out of a desire to merge the high energy of a club night with the deep restorative power of mindful movement."
            align="center"
          />
        </div>

        {/* Our Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20 md:mb-32">
          <div className="relative h-[400px] md:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl">
            <Image 
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2000&auto=format&fit=crop" 
              alt="YogaJam Community Event" 
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"></div>
          </div>
          
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white">Our Story</h2>
            <div className="prose prose-invert md:prose-lg text-foreground-secondary leading-relaxed">
              <p>
                What started as a small gathering of friends looking for a different way to unwind on a Friday night has evolved into a nationwide movement. We realized that traditional yoga studios often felt too rigid, while nightlife felt too depleting.
              </p>
              <p>
                YogaJam is the bridge between the two. We curate cinematic wellness experiences in unexpected venues—from dark, UV-lit warehouse spaces to serene rooftop sunsets. 
              </p>
              <p>
                Our mission is simple: to help you find your center and unleash your energy simultaneously. No judgment, no expectations—just good vibes, great music, and a community that moves together.
              </p>
            </div>
          </div>
        </div>

        {/* Core Values Section */}
        <div className="mb-20 md:mb-32">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-white mb-12">What Drives Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Cinematic Atmosphere",
                desc: "Lighting, sound, and space design are just as important as the physical practice. We build immersive environments that take you out of your daily routine."
              },
              {
                title: "Inclusivity First",
                desc: "Whether you've been practicing for ten years or ten minutes, there's a mat for you here. Our instructors provide modifications for every single body type and skill level."
              },
              {
                title: "Community Driven",
                desc: "The magic happens off the mat just as much as on it. We design our events to foster real human connections in an increasingly digital world."
              }
            ].map((value, i) => (
              <div key={i} className="p-8 rounded-3xl bg-surface/50 border border-white/5 backdrop-blur-sm hover:bg-surface hover:border-accent/30 transition-all">
                <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                <p className="text-foreground-secondary leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Partner Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="flex flex-col p-8 md:p-12 rounded-3xl bg-surface border border-white/5 hover:border-accent/30 transition-colors">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4">Get in Touch</h2>
            <p className="text-foreground-secondary mb-8 leading-relaxed max-w-md">
              Have a question about our events? Want to know what to bring? Or just want to say hi? We'd love to hear from you.
            </p>
            <div className="flex flex-col gap-4 mt-auto">
              <a href={`mailto:${contactData.email}`} className="inline-flex items-center gap-3 text-white hover:text-accent transition-colors w-fit">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {contactData.email}
              </a>
              <a href={`https://wa.me/${contactData.whatsapp.replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-white hover:text-accent transition-colors w-fit">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp Us
              </a>
            </div>
          </div>

          <div className="flex flex-col p-8 md:p-12 rounded-3xl bg-surface border border-white/5 hover:border-accent/30 transition-colors">
            <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4">Partner With Us</h3>
            <p className="text-foreground-secondary mb-8 leading-relaxed">
              We are always looking to collaborate with brands, venues, and creators that align with our vision of cinematic wellness. 
              Let's create something extraordinary together.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-auto">
              <Link href="/personalized-events" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-accent text-background font-bold text-sm hover:scale-105 transition-transform">
                Explore Private Events
              </Link>
              <span className="text-foreground-secondary hidden sm:inline">or</span>
              <a href={`mailto:${contactData.partnershipsEmail}`} className="text-white hover:text-accent font-medium transition-colors underline underline-offset-4 break-all">
                Email Partnerships
              </a>
            </div>
          </div>
          
        </div>

      </Container>
    </main>
  );
}
