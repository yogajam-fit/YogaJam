"use client";
import * as React from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ContactIcons } from "@/components/ui/ContactModal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { EventRecord } from "@/components/admin/EventsTable";
import { createClient } from "@/utils/supabase/client";
import { formatPrice, toTitleCase } from "@/lib/utils";

export function EventDetailClient({ event }: { event: EventRecord }) {
  const [mounted, setMounted] = React.useState(false);
  const [showVideo, setShowVideo] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
    if (event.video) {
      const timer = setTimeout(() => {
        setShowVideo(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [event.video]);

  return (
    <main className="min-h-screen bg-background">
      {/* Cinematic Hero */}
      <section className="relative w-full min-h-[50vh] md:h-[70vh] flex items-end pb-8 md:pb-16 pt-28 md:pt-32">
        <div className="absolute inset-0 z-0 bg-black">
          <Image
            src={event.image}
            alt={event.title}
            fill
            unoptimized={true}
            sizes="100vw"
            priority
            className={`object-cover transition-opacity duration-1000 ${showVideo ? 'opacity-0' : 'opacity-60'}`}
          />
          {event.video && (
            <video 
              src={event.video} 
              autoPlay 
              muted 
              loop 
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${showVideo ? 'opacity-60' : 'opacity-0'}`}
            />
          )}
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
            <div className="flex flex-col gap-4 text-sm md:text-base font-semibold text-accent-warm tracking-wide mt-6 p-4 md:p-6 bg-surface/30 backdrop-blur-md rounded-2xl border border-white/10 w-full md:w-fit">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {toTitleCase(event.date)}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="uppercase">{event.time}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-foreground-secondary">
                <svg className="w-5 h-5 opacity-80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {toTitleCase(event.location)}, {toTitleCase(event.city)}
              </div>
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
              <div className="whitespace-pre-wrap font-sans text-foreground-secondary leading-relaxed mb-16 text-lg">
                {event.full_desc}
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
                  {event.run_of_show?.map((step, i) => (
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
                  <h3 className="text-xl font-bold font-heading mb-2 text-foreground">Reserve your spot</h3>
                  <p className="text-sm text-foreground-secondary mb-6">Spots are extremely limited. Secure your ticket now before we sell out.</p>
                </div>
                {event.booking_type === 'contact' ? (
                  <div className="max-w-lg mx-auto md:ml-auto md:mr-0 lg:mx-0 lg:max-w-none w-full">
                    <ContactIcons />
                  </div>
                ) : (
                  <div className="max-w-lg mx-auto md:ml-auto md:mr-0 lg:mx-0 lg:max-w-none w-full">
                    <BookingButton event={event} mounted={mounted} />
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

function BookingButton({ event, mounted }: { event: EventRecord, mounted: boolean }) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const [isQRModalOpen, setIsQRModalOpen] = React.useState(false);
  const [step, setStep] = React.useState<1 | 2>(1);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [contact, setContact] = React.useState("");
  const [numTickets, setNumTickets] = React.useState(1);
  const [errors, setErrors] = React.useState<{name?: string, email?: string, contact?: string, utr?: string, tickets?: string}>({});

  const [utrNumber, setUtrNumber] = React.useState("");
  const [screenshotFile, setScreenshotFile] = React.useState<File | null>(null);
  const [verifyMethod, setVerifyMethod] = React.useState<"screenshot" | "utr">("screenshot");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Full name is required.";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Please enter a valid email address.";
    if (!contact.trim()) {
      newErrors.contact = "Phone number is required.";
    } else if (contact.length !== 10) {
      newErrors.contact = "Phone number must be exactly 10 digits.";
    }
    if (numTickets < 1) newErrors.tickets = "At least 1 ticket is required.";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setStep(2);
  };

  const handleQRSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyMethod === 'utr' && utrNumber.length !== 12) {
      setErrors({ utr: "UTR Number must be exactly 12 digits." });
      return;
    }
    if (verifyMethod === 'screenshot' && !screenshotFile) {
      alert("Please select a screenshot file to upload.");
      return;
    }
    
    setErrors({});
    setIsSubmitting(true);
    
    const supabase = createClient();
    
    let screenshotUrl = null;
    
    if (verifyMethod === 'screenshot' && screenshotFile) {
      const fileExt = screenshotFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `screenshots/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('event-media')
        .upload(filePath, screenshotFile);
        
      if (uploadError) {
        console.error("Screenshot upload error:", uploadError);
        alert("Failed to upload screenshot. Please try again.");
        setIsSubmitting(false);
        return;
      }
      
      const { data } = supabase.storage.from('event-media').getPublicUrl(filePath);
      screenshotUrl = data.publicUrl;
    }
    
    // Calculate total amount based on event.price and numTickets
    const priceNumeric = parseInt(event.price.replace(/\D/g, '')) || 0;
    const totalAmount = priceNumeric > 0 ? `₹${priceNumeric * numTickets}` : 'Free';
    
    const { error } = await supabase.from('booking_requests').insert([{
      event_id: event.id,
      name,
      email,
      phone: contact,
      tickets: numTickets,
      total_amount: totalAmount,
      verify_method: verifyMethod,
      utr_number: verifyMethod === 'utr' ? utrNumber : null,
      screenshot_url: screenshotUrl,
      status: 'pending'
    }]);

    setIsSubmitting(false);
    
    if (error) {
      console.error(error);
      alert("Failed to submit request. Please try again or contact us.");
    } else {
      setIsSubmitted(true);
    }
  };

  const resetModal = () => {
    setIsQRModalOpen(false);
    setTimeout(() => {
      setStep(1);
      setIsSubmitted(false);
      setUtrNumber("");
      setScreenshotFile(null);
      setName("");
      setEmail("");
      setContact("");
      setErrors({});
    }, 300); // Wait for modal close animation
  };

  const bookingType = event?.booking_type || "platform";
  const links = event?.booking_links;
  const buttonText = event?.price ? `Book Now • ${formatPrice(event.price)}` : "Book Now";

  if (bookingType === "contact") {
    return null;
  }

  if (bookingType === "qr") {
    return (
      <>
        <Button onClick={() => setIsQRModalOpen(true)} size="lg" variant="primary" className="w-full h-14 text-sm sm:text-base font-semibold shadow-[0_0_20px_rgba(200,232,107,0.2)] hover:shadow-[0_0_30px_rgba(200,232,107,0.4)] transition-all">
          {buttonText}
        </Button>
        {isQRModalOpen && mounted && createPortal(
          <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm md:p-4" onClick={resetModal}>
            <div 
              className="relative w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden bg-surface sm:border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 sm:zoom-in-95 duration-300 ease-out" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0 bg-surface/80 backdrop-blur-xl z-10">
                <h2 className="text-xl md:text-2xl font-bold font-heading text-foreground">
                  {isSubmitted ? "Request Sent" : (step === 1 ? "Your Details" : "Complete Your Payment")}
                </h2>
                <button 
                  onClick={resetModal}
                  className="p-2 -mr-2 text-foreground-secondary hover:text-foreground transition-colors rounded-full hover:bg-white/5 bg-background/50 border border-white/5"
                  aria-label="Close dialog"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar relative flex-1">
                {!isSubmitted ? (
                  <>
                    <p className="text-sm text-foreground-secondary mb-6 text-center">
                      {step === 1 
                        ? "Please enter your details to reserve your spot." 
                        : "Scan the QR code to pay, then upload a screenshot or enter your UTR number below."}
                    </p>
                    
                    {step === 1 ? (
                      <form onSubmit={handleNextStep} className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300" noValidate>
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-semibold text-foreground-secondary uppercase">Full Name</label>
                          <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className={`w-full bg-background/50 border ${errors.name ? 'border-red-400/50' : 'border-white/10'} rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all`} />
                          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-semibold text-foreground-secondary uppercase">Email Address</label>
                          <input type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full bg-background/50 border ${errors.email ? 'border-red-400/50' : 'border-white/10'} rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all`} />
                          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-semibold text-foreground-secondary uppercase">Phone Number</label>
                          <input type="tel" placeholder="9876543210" value={contact} onChange={(e) => setContact(e.target.value.replace(/\D/g, '').slice(0, 10))} className={`w-full bg-background/50 border ${errors.contact ? 'border-red-400/50' : 'border-white/10'} rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all`} />
                          {errors.contact && <p className="text-red-400 text-xs mt-1">{errors.contact}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-semibold text-foreground-secondary uppercase">Number of Tickets</label>
                          <div className={`flex items-center gap-6 w-max bg-background/50 border ${errors.tickets ? 'border-red-400/50' : 'border-white/10'} rounded-xl px-4 py-2 transition-all`}>
                            <span className="text-xl font-bold text-foreground font-heading">{numTickets}</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setNumTickets(Math.max(1, numTickets - 1))}
                                disabled={numTickets <= 1}
                                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 text-foreground disabled:opacity-30 disabled:hover:bg-white/5 disabled:active:scale-100 transition-all"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => setNumTickets(Math.min(10, numTickets + 1))}
                                disabled={numTickets >= 10}
                                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 text-foreground disabled:opacity-30 disabled:hover:bg-white/5 disabled:active:scale-100 transition-all"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                              </button>
                            </div>
                          </div>
                          {errors.tickets && <p className="text-red-400 text-xs mt-1">{errors.tickets}</p>}
                        </div>
                        <Button type="submit" className="w-full h-12 bg-accent text-background font-bold mt-2 hover:scale-[1.02] transition-transform">
                          Proceed to Payment
                        </Button>
                      </form>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        {event?.price && (
                          <div className="text-center mb-6">
                            <p className="text-sm text-foreground-secondary font-medium mb-1">Total Amount ({numTickets} {numTickets === 1 ? 'ticket' : 'tickets'})</p>
                            <p className="text-3xl font-bold text-accent font-heading">
                              ₹{(parseInt(event.price.replace(/\D/g, ''), 10) * numTickets).toLocaleString('en-IN')}
                            </p>
                          </div>
                        )}
                        <div className="flex justify-center mb-6">
                          <div className="bg-white p-4 rounded-xl">
                            <Image src={event?.qr_code || "/images/hero/hero-bg.jpg"} alt="QR Code" width={200} height={200} unoptimized={true} className="object-cover rounded-lg w-[200px] h-[200px]" />
                          </div>
                        </div>

                        <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-6">
                          <button
                            type="button"
                            onClick={() => setVerifyMethod('screenshot')}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${verifyMethod === 'screenshot' ? 'bg-accent text-background' : 'text-foreground-secondary hover:text-foreground'}`}
                          >
                            Screenshot
                          </button>
                          <button
                            type="button"
                            onClick={() => setVerifyMethod('utr')}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${verifyMethod === 'utr' ? 'bg-accent text-background' : 'text-foreground-secondary hover:text-foreground'}`}
                          >
                            UTR Number
                          </button>
                        </div>

                        <form onSubmit={handleQRSubmit} className="flex flex-col gap-4" noValidate>
                          {verifyMethod === 'screenshot' ? (
                            <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                              <label className="text-xs font-semibold text-foreground-secondary uppercase">Upload Screenshot</label>
                              <input key="file-input" type="file" accept="image/*" onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)} className="text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20 transition-all cursor-pointer" required />
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                              <label className="text-xs font-semibold text-foreground-secondary uppercase">Enter UTR Number</label>
                              <input key="utr-input" type="text" placeholder="Enter 12-digit UTR / Transaction ID" value={utrNumber} onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))} pattern="\d{12}" title="UTR Number must be exactly 12 digits" className={`w-full bg-background/50 border ${errors.utr ? 'border-red-400/50' : 'border-white/10'} rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all`} />
                              {errors.utr && <p className="text-red-400 text-xs mt-1">{errors.utr}</p>}
                            </div>
                          )}
                          <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-accent text-background font-bold mt-2 hover:scale-[1.02] transition-transform">
                            {isSubmitting ? (
                              <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                              </span>
                            ) : (
                              "Submit Payment"
                            )}
                          </Button>
                        </form>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[350px] py-12 text-center animate-in fade-in zoom-in-95 duration-500 ease-out">
                    <h3 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-4 tracking-tight">
                      Thank <span className="text-accent-warm">You!</span>
                    </h3>
                    
                    <p className="text-base md:text-lg text-foreground-secondary max-w-[80%] leading-relaxed mx-auto">
                      Your journey begins here. We've received your request and our team will verify your payment and send your ticket shortly to <strong className="text-foreground font-semibold">{email}</strong>.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }

  const hasBMS = !!links?.bookmyshow;
  const hasDistrict = !!links?.district;
  const numLinks = (hasBMS ? 1 : 0) + (hasDistrict ? 1 : 0);

  if (numLinks === 0) {
    return (
      <Button size="lg" variant="primary" className="w-full h-14 text-sm sm:text-base font-semibold shadow-[0_0_20px_rgba(200,232,107,0.2)] hover:shadow-[0_0_30px_rgba(200,232,107,0.4)] transition-all">
        {buttonText}
      </Button>
    );
  }

  return (
    <>
      <div
        className="relative w-full h-14 rounded-xl cursor-pointer shadow-[0_0_20px_rgba(200,232,107,0.2)] bg-accent hover:shadow-[0_0_30px_rgba(200,232,107,0.4)] transition-all overflow-hidden group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsMobileMenuOpen(true)}
      >
        {/* Default state */}
        <div
          className="absolute inset-0 flex items-center justify-center text-background text-sm sm:text-base font-bold transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] px-2"
          style={{
            opacity: isHovered ? 0 : 1,
            transform: isHovered ? "translateY(-8px)" : "translateY(0)"
          }}
        >
          {buttonText}
        </div>

        {/* Hover state (Desktop Only - lg and up) */}
        <div
          className="absolute inset-0 hidden lg:flex items-center justify-center gap-2 p-1 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? "translateY(0)" : "translateY(8px)"
          }}
        >
          {hasBMS && (
            <a href={links.bookmyshow!} target="_blank" rel="noopener noreferrer" className={`h-full bg-background/10 hover:bg-background/20 rounded-lg flex items-center justify-center transition-colors ${hasDistrict ? 'w-1/2' : 'w-full'}`} onClick={(e) => e.stopPropagation()}>
              <Image src="/images/booking_platforms/bookmyshow-logo-vector.svg" alt="BookMyShow" width={300} height={100} className="w-[95%] h-[95%] object-contain" />
            </a>
          )}
          {hasDistrict && (
            <a href={links.district!} target="_blank" rel="noopener noreferrer" className={`h-full bg-background/10 hover:bg-background/20 rounded-lg flex items-center justify-center transition-colors ${hasBMS ? 'w-1/2' : 'w-full'}`} onClick={(e) => e.stopPropagation()}>
              <Image src="/images/booking_platforms/districtlogo.webp" alt="District" width={300} height={100} className="h-[90%] w-auto object-contain rounded-xl shadow-lg" />
            </a>
          )}
        </div>
      </div>

      {/* Mobile & Tablet Popover Bottom Sheet */}
      {isMobileMenuOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[200] lg:hidden flex items-end justify-center bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="w-full bg-surface border-t border-white/10 rounded-t-3xl p-6 pb-12 animate-in slide-in-from-bottom-full duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-foreground font-heading">Choose Platform</h3>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-foreground-secondary hover:text-foreground p-2 -mr-2 bg-background/50 rounded-full border border-white/5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {hasBMS && (
                <a
                  href={links.bookmyshow!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-24 p-2 rounded-2xl border border-white/5 bg-background/50 active:scale-95 transition-all hover:bg-white/5"
                >
                  <Image src="/images/booking_platforms/bookmyshow-logo-vector.svg" alt="BookMyShow" width={400} height={120} className="w-[85%] h-[85%] object-contain" />
                </a>
              )}
              {hasDistrict && (
                <a
                  href={links.district!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-24 p-2 rounded-2xl border border-white/5 bg-background/50 active:scale-95 transition-all hover:bg-white/5"
                >
                  <Image src="/images/booking_platforms/districtlogo.webp" alt="District" width={400} height={120} className="h-[90%] w-auto object-contain rounded-2xl shadow-xl" />
                </a>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
