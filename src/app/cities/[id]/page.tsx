"use client";

import * as React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { createClient } from "@/utils/supabase/client";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EventCard } from "@/components/ui/EventCard";
import { activeCities, upcomingCities, City } from "@/content/cities";


export default function CityDetailPageWrapper({ params }: { params: Promise<{ id: string }> }) {
  return <CityDetailClient params={params} />;
}

function CityDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  // Find city in either active or upcoming
  const allCities = [...activeCities, ...upcomingCities];
  const city = allCities.find((c) => c.id === id);

  if (!city) {
    notFound();
  }

  // Fetch active events for this city from Supabase
  const [cityEvents, setCityEvents] = React.useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loadingEvents, setLoadingEvents] = React.useState(true);

  React.useEffect(() => {
    async function fetchCityEvents() {
      const supabase = createClient();
      const { data } = await supabase
        .from('events')
        .select('*')
        .ilike('location', `%${city?.name}%`);
        
      if (data) {
        // Sort chronologically
        const sorted = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setCityEvents(sorted);
      }
      setLoadingEvents(false);
    }
    
    if (city) {
      fetchCityEvents();
    }
  }, [city]);

  const hasEvents = cityEvents.length > 0;

  // Inline Waitlist Form State
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    const supabase = createClient();
    const { error: supabaseError } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email: email.trim(), source: `city_waitlist - ${city.name}` }]);
    
    setIsSubmitting(false);
    
    if (supabaseError) {
      if (supabaseError.code === '23505') {
        setIsSubmitted(true); // Already subscribed
      } else {
        setError("Something went wrong. Please try again.");
      }
    } else {
      setIsSubmitted(true);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Cinematic Hero */}
      <section className="relative w-full min-h-[50vh] md:h-[60vh] flex items-end pb-8 md:pb-16 pt-28 md:pt-32">
        <div className="absolute inset-0 z-0 bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={city.image}
            alt={city.name}
            className="w-full h-full object-cover opacity-60"
          />
          {/* Gradients for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
        </div>

        <Container className="relative z-10 w-full">
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground font-heading mb-4 drop-shadow-lg leading-tight">
              YogaJam <span className="text-accent-warm">{city.name}</span>
            </h1>
            
            {/* Key Details Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 text-sm md:text-base font-semibold text-foreground tracking-wide uppercase mt-6 p-4 md:p-6 bg-surface/30 backdrop-blur-md rounded-2xl border border-white/10 w-full md:w-fit">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${hasEvents ? 'bg-accent animate-pulse' : 'bg-foreground-secondary'}`} />
                {loadingEvents ? 'Loading Events...' : (hasEvents ? `${cityEvents.length} Active Events` : 'Coming Soon')}
              </div>
              <div className="flex items-center gap-2 text-foreground-secondary">
                <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {city.locations.length} Signature Locations
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content Layout */}
      <section className="pt-8 pb-12 md:py-20 relative z-10">
        <Container>
          <div className="flex flex-col-reverse lg:flex-row gap-12 lg:gap-20">
            
            {/* Left Column - City Info */}
            <div className="w-full lg:w-3/5 flex flex-col gap-16">
              
              {/* About the City */}
              <div>
                <SectionHeading title={`The Vibe in ${city.name}`} align="left" className="mb-6" />
                <div className="prose prose-invert prose-lg max-w-none text-foreground-secondary leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: city.fullDesc }} />
                </div>
              </div>

              {/* Where we host */}
              <div>
                <SectionHeading title="Where we host" align="left" className="mb-6" />
                <div className="flex flex-wrap gap-3">
                  {city.locations.map((loc, i) => (
                    <div key={i} className="px-5 py-2.5 rounded-full bg-surface border border-white/5 text-foreground font-medium text-sm hover:border-accent/30 transition-colors">
                      {loc}
                    </div>
                  ))}
                </div>
              </div>

              {/* Event Types */}
              <div>
                <SectionHeading title="Experiences to expect" align="left" className="mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {city.eventTypes.map((type, i) => (
                    <div key={i} className="flex flex-col gap-3 p-6 rounded-3xl bg-surface border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-accent shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6L12 17.2l-6.2 4.5 2.4-7.6L2 9.6h7.6L12 2z" />
                        </svg>
                        <h3 className="text-lg font-bold text-foreground">{type.name}</h3>
                      </div>
                      <p className="text-foreground-secondary text-sm leading-relaxed">
                        {type.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Who Can Join */}
              <div className="pt-8 border-t border-white/5">
                <SectionHeading title={`Who can join YogaJam in ${city.name}?`} align="left" className="mb-6" />
                <div className="prose prose-invert prose-lg max-w-none text-foreground-secondary leading-relaxed">
                  <p>
                    Whether you are stepping onto the mat for the very first time or you are an advanced practitioner looking to deepen your flow, YogaJam is built for everyone. Our sessions in {city.name} are expertly curated to offer modifications and advancements, ensuring every individual finds their rhythm.
                  </p>
                  <p>
                    We believe in an inclusive, judgment-free environment. Come for the movement, stay for the community. Just bring your energy, and we'll take care of the rest.
                  </p>
                </div>
              </div>

              {/* Host an Event */}
              <div className="pt-8 border-t border-white/5 mb-10">
                <div className="bg-gradient-to-br from-surface to-background border border-white/10 p-8 md:p-12 rounded-3xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 flex flex-col items-start gap-4">
                    <div className="inline-block px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent-warm text-xs font-semibold tracking-widest uppercase">
                      Private Experiences
                    </div>
                    <SectionHeading title={`Host your special occasion in ${city.name}`} align="left" className="mb-6" />
                    <p className="text-foreground-secondary max-w-2xl leading-relaxed">
                      Looking to elevate your next gathering? From exclusive birthday jams and private rooftop flows to immersive corporate wellness retreats, we design bespoke YogaJam experiences tailored entirely to your aesthetic and energy.
                    </p>
                    <Link href="/personalized-events" className="mt-4 inline-flex items-center justify-center h-12 px-6 rounded-xl bg-accent text-background font-bold text-sm transition-all shadow-[0_0_20px_rgba(200,232,107,0.2)] hover:shadow-[0_0_30px_rgba(200,232,107,0.4)] hover:scale-105">
                      Explore Private Events
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Events or Waitlist */}
            <div className="w-full lg:w-2/5">
              <div className="lg:sticky lg:top-32 flex flex-col gap-6">
                
                {loadingEvents ? (
                  <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div></div>
                ) : hasEvents ? (
                  <div>
                    <SectionHeading title="Active Events" align="left" className="mb-6" />
                    <div className="flex lg:grid overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none gap-4 lg:gap-6 pb-6 lg:pb-0 -mx-4 lg:mx-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {cityEvents.map((event, index) => (
                        <div key={event.id} className={`w-[40vw] sm:w-[30vw] md:w-[30vw] snap-center shrink-0 lg:w-auto lg:min-w-0 ${index === 0 ? 'ml-4 lg:ml-0' : ''} ${index === cityEvents.length - 1 ? 'mr-4 lg:mr-0' : ''}`}>
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
                            actionText="Reserve"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-surface/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Decorative blurred background element */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/20 blur-3xl rounded-full" />
                    
                    <div className="relative z-10">
                      <div className="mb-8">
                        <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-foreground-secondary text-xs font-semibold tracking-widest uppercase mb-4">
                          Coming Soon
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold font-heading mb-2 text-foreground">We&apos;re expanding.</h3>
                        <p className="text-sm md:text-base text-foreground-secondary leading-relaxed">
                          Tickets aren&apos;t live yet for {city.name}. Drop your email below to get early access when we launch.
                        </p>
                      </div>

                      {isSubmitted ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in-95 duration-500">
                          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <h4 className="text-xl font-bold text-foreground mb-2">You&apos;re on the list!</h4>
                          <p className="text-sm text-foreground-secondary">Keep an eye on your inbox.</p>
                        </div>
                      ) : (
                        <form onSubmit={handleWaitlistSubmit} className="flex flex-col gap-4" noValidate>
                          <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="text-xs font-semibold tracking-wide text-foreground-secondary uppercase">Email Address</label>
                            <input 
                              type="email" 
                              id="email" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className={`w-full bg-background/50 border ${error ? 'border-red-400/50' : 'border-white/10'} rounded-xl px-4 py-3.5 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all`}
                              placeholder="hello@example.com"
                            />
                            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                          </div>
                          
                          <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full mt-2 h-12 bg-accent text-background font-bold text-sm tracking-wide rounded-xl transition-all shadow-[0_0_20px_rgba(200,232,107,0.2)] hover:shadow-[0_0_30px_rgba(200,232,107,0.4)] hover:scale-105 relative"
                          >
                            {isSubmitting ? (
                              <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Joining...
                              </span>
                            ) : (
                              "Notify Me"
                            )}
                          </Button>
                        </form>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </Container>
      </section>

    </main>
  );
}
