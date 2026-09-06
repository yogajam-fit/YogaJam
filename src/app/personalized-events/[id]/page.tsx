import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ContactIcons } from "@/components/ui/ContactModal";
import { StartPlanningModal } from "@/components/ui/StartPlanningModal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { personalizedEventsData } from "@/content/personalized-events";

export default async function PersonalizedEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = personalizedEventsData.find((e) => e.id === id);

  if (!event) {
    notFound();
  }



  return (
    <main className="min-h-screen bg-background">
      {/* Cinematic Hero */}
      <section className="relative w-full min-h-[50vh] md:h-[70vh] flex items-end pb-8 md:pb-16 pt-28 md:pt-32">
        <div className="absolute inset-0 z-0 bg-black">
          <Image
            src={event.image}
            alt={event.title}
            fill
            sizes="100vw"
            priority
            className="object-cover opacity-60"
          />
          {/* Gradients for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
        </div>

        <Container className="relative z-10 w-full">
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground font-heading mb-4 drop-shadow-lg leading-tight">
              {event.title}
            </h1>
            
            {/* Key Details Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 text-sm md:text-base font-semibold text-accent-warm tracking-wide uppercase mt-6 p-4 md:p-6 bg-surface/30 backdrop-blur-md rounded-2xl border border-white/10 w-full md:w-fit">
              {event.size && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {event.size}
                </div>
              )}
              {event.duration && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {event.duration}
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2 text-foreground-secondary">
                  <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {event.location}
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content & CTA */}
      <section className="pt-8 pb-12 md:py-20 relative z-10">
        <Container>
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            {/* Description */}
            <div className="w-full lg:w-2/3">
              <SectionHeading title="About this experience" align="left" className="mb-6" />
              <div className="prose prose-invert prose-lg max-w-none text-foreground-secondary leading-relaxed mb-16">
                <div dangerouslySetInnerHTML={{ __html: event.fullDesc }} />
              </div>

              {/* What's Included */}
              <div className="mb-16">
                <SectionHeading title="What’s included" align="left" className="mb-8" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                  {event.includes?.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-accent shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6L12 17.2l-6.2 4.5 2.4-7.6L2 9.6h7.6L12 2z" />
                      </svg>
                      <span className="text-foreground-secondary text-base font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* The Run of Show */}
              <div>
                <SectionHeading title="The run of show" align="left" className="mb-8" />
                <div className="relative border-l border-white/10 ml-3 pl-8 py-2 flex flex-col gap-10">
                  {event.runOfShow?.map((step, i) => (
                    <div key={i} className="relative">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[39.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-accent border-2 border-background shadow-[0_0_10px_rgba(200,232,107,0.5)]" />
                      
                      <div className="text-accent-warm text-sm font-semibold tracking-wider uppercase mb-1.5">{step.time}</div>
                      <h4 className="text-lg font-bold text-foreground mb-1">{step.title}</h4>
                      <p className="text-foreground-secondary text-sm md:text-base">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/90 backdrop-blur-xl border-t border-white/10 lg:static lg:bg-transparent lg:border-none lg:p-0 lg:w-1/3 lg:mt-0 lg:z-auto">
              <div className="lg:sticky lg:top-32 lg:bg-surface/50 lg:backdrop-blur-xl lg:border lg:border-white/5 lg:rounded-3xl lg:p-8 lg:shadow-2xl">
                <div className="hidden lg:block">
                  <h3 className="text-xl font-bold font-heading mb-2 text-foreground">Inquire Now</h3>
                  <p className="text-sm text-foreground-secondary mb-6">Our personalized events are custom-tailored to your needs. Reach out to start planning.</p>
                </div>
                <div className="flex flex-row-reverse lg:flex-col gap-3 lg:gap-4 items-center lg:items-stretch max-w-lg mx-auto md:ml-auto md:mr-0 lg:mx-0 lg:max-w-none">
                  <div className="w-[60%] lg:w-full">
                    <StartPlanningModal eventTitle={event.title}>
                      <Button size="lg" variant="primary" className="w-full h-14 text-sm sm:text-base font-semibold shadow-[0_0_20px_rgba(200,232,107,0.2)] hover:shadow-[0_0_30px_rgba(200,232,107,0.4)] transition-all pointer-events-none">
                        Start Planning
                      </Button>
                    </StartPlanningModal>
                  </div>
                  <div className="w-[40%] lg:w-full">
                    <ContactIcons />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>


    </main>
  );
}
