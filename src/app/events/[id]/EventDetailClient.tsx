"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { BaseModal } from "@/components/ui/BaseModal";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ContactIcons } from "@/components/ui/ContactModal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { EventRecord } from "@/components/admin/EventsTable";
import { createClient } from "@/utils/supabase/client";
import { formatPrice, toTitleCase } from "@/lib/utils";

const getOriginalVideoUrl = (url?: string) => {
  if (!url) return url;
  if (url.includes('ik.imagekit.io') && !url.includes('tr=')) {
    return url + (url.includes('?') ? '&' : '?') + 'tr=orig-true';
  }
  return url;
};

export function EventDetailClient({ event }: { event: EventRecord }) {
  const [mounted, setMounted] = React.useState(false);
  const [showVideo, setShowVideo] = React.useState(false);

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const isPastEvent = event?.date ? new Date(event.date) < now : false;
  
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
      <section className="relative w-full min-h-[60vh] md:min-h-[70vh] flex items-end pb-8 md:pb-8 pt-28 md:pt-32">
        <div className="absolute inset-0 z-0 bg-black">
          <Image
            src={event.image}
            alt={event.title}
            fill
            sizes="100vw"
            priority
            className={`object-cover transition-opacity duration-1000 ${showVideo ? 'opacity-0' : 'opacity-60'}`}
          />
          {event.video && showVideo && (
            <video 
              src={`${getOriginalVideoUrl(event.video)}#t=0.001`} 
              autoPlay 
              muted 
              loop 
              playsInline
              preload="metadata"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 opacity-60`}
            />
          )}
          {/* Gradients for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
        </div>

        <Container className="relative z-10 w-full">
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground font-heading mb-4 drop-shadow-lg leading-tight">
              {event.title}
            </h1>

            {event.preview_highlight && (
              <p className="text-lg md:text-xl text-accent font-normal mb-2 drop-shadow-md">
                {event.preview_highlight}
              </p>
            )}
            
            {/* Key Details Bar */}
            <div className="flex flex-col gap-4 text-sm md:text-base font-semibold text-accent-warm tracking-wide mt-6 p-4 md:p-6 bg-surface/30 backdrop-blur-md rounded-2xl border border-border w-full md:w-fit">
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
              <div className="flex items-start gap-2 text-text-secondary">
                <svg className="w-5 h-5 opacity-80 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="leading-relaxed">
                  <span className="inline">{toTitleCase(event.location)}, {toTitleCase(event.city)}</span>
                  {event.location_url && (
                    <a 
                      href={event.location_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded bg-surface-elevated hover:bg-surface-interactive border border-border text-xs font-semibold text-accent transition-colors align-middle translate-y-[-1px] whitespace-nowrap"
                    >
                      View Map
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content & CTA */}
      <section className="pt-8 pb-12 md:pt-8 md:pb-20 relative z-10">
        <Container>
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            {/* Description */}
            <div className="w-full lg:w-2/3">
              
              <SectionHeading title="About this experience" align="left" className="mb-6" />
              <div className="whitespace-pre-wrap font-sans text-text-secondary leading-relaxed mb-16 text-lg">
                {event.full_desc}
              </div>

              {/* What's Included */}
              {event.includes && event.includes.length > 0 && (
                <div className="mb-16">
                  <SectionHeading title="What’s included" align="left" className="mb-8" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                    {event.includes.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-accent shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6L12 17.2l-6.2 4.5 2.4-7.6L2 9.6h7.6L12 2z" />
                        </svg>
                        <span className="text-text-secondary text-base font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* The Run of Show */}
              {event.run_of_show && event.run_of_show.length > 0 && (
                <div>
                  <SectionHeading title="The run of show" align="left" className="mb-8" />
                  <div className="relative border-l border-border ml-3 pl-8 py-2 flex flex-col gap-10">
                    {event.run_of_show.map((step, i) => (
                      <div key={i} className="relative">
                        {/* Timeline Dot */}
                        <div className="absolute -left-[39.5px] top-1.5 w-3.5 h-3.5 rounded-full bg-accent border-2 border-background shadow-[0_0_10px_rgba(200,232,107,0.5)]" />
                        
                        <div className="text-accent-warm text-sm font-semibold tracking-wider uppercase mb-1.5">{step.time}</div>
                        <h4 className="text-lg font-bold text-foreground mb-1">{step.title}</h4>
                        <p className="text-text-secondary text-sm md:text-base">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Past Videos Gallery */}
              {isPastEvent && event.past_videos && event.past_videos.length > 0 && (
                <div className="mt-16 mb-8 w-full">
                  <SectionHeading title="Event Gallery" align="left" className="mb-8" />
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                    {event.past_videos.map((vid: string, idx: number) => (
                      <VideoWithLoader key={idx} src={getOriginalVideoUrl(vid) as string} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CTA Section */}
            {isPastEvent ? (
              <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/90 backdrop-blur-xl border-t border-border lg:static lg:bg-transparent lg:border-none lg:p-0 lg:w-1/3 lg:mt-0 lg:z-auto">
                <div className="lg:sticky lg:top-32 lg:bg-surface/50 lg:backdrop-blur-xl lg:border lg:border-border lg:rounded-3xl lg:p-8 lg:shadow-2xl">
                  <div className="hidden lg:block">
                    <h3 className="text-xl font-bold font-heading mb-2 text-foreground">Event Completed</h3>
                    <p className="text-sm text-text-secondary mb-6">This event has already happened. Don't miss out on our future sessions!</p>
                  </div>
                  <Link href="/events" className="w-full block">
                    <Button size="lg" variant="primary" className="w-full h-14 text-sm sm:text-base font-semibold shadow-[0_0_20px_rgba(200,232,107,0.2)] hover:shadow-[0_0_30px_rgba(200,232,107,0.4)] transition-all">
                      See Upcoming Events
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/90 backdrop-blur-xl border-t border-border lg:static lg:bg-transparent lg:border-none lg:p-0 lg:w-1/3 lg:mt-0 lg:z-auto">
                <div className="lg:sticky lg:top-32 lg:bg-surface/50 lg:backdrop-blur-xl lg:border lg:border-border lg:rounded-3xl lg:p-8 lg:shadow-2xl">
                  <div className="hidden lg:block">
                    <h3 className="text-xl font-bold font-heading mb-2 text-foreground">
                      {event?.booking_type === "coming_soon" ? "Opening Soon" : "Reserve your spot"}
                    </h3>
                    <p className="text-sm text-text-secondary mb-6">
                      {event?.booking_type === "coming_soon" 
                        ? "Booking hasn't opened for this event yet. Check back soon for updates." 
                        : "Spots are extremely limited. Secure your ticket now before we sell out."}
                    </p>
                  </div>
                  <div className="max-w-lg mx-auto md:ml-auto md:mr-0 lg:mx-0 lg:max-w-none w-full">
                    <BookingButton event={event} mounted={mounted} />
                  </div>
                </div>
              </div>
            )}
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
      try {
        const authRes = await fetch("/api/imagekit-auth");
        if (!authRes.ok) {
          throw new Error("Failed to get ImageKit upload authentication");
        }
        const authParams = await authRes.json();

        const safeFileName = screenshotFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        
        const formData = new FormData()
        formData.append("file", screenshotFile)
        formData.append("fileName", safeFileName)
        formData.append("folder", "/events/screenshots")
        formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!)
        formData.append("signature", authParams.signature)
        formData.append("expire", authParams.expire.toString())
        formData.append("token", authParams.token)
        formData.append("useUniqueFileName", "true")

        const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          let errStr = "Upload failed";
          try {
            const errData = await response.json();
            errStr = errData.message || errStr;
          } catch {}
          throw new Error(errStr);
        }

        const data = await response.json()
        screenshotUrl = data.url
      } catch (error) {
        console.error("Screenshot upload error:", error);
        alert("Failed to upload screenshot. Please try again.");
        setIsSubmitting(false);
        return;
      }
    }
    
    // Calculate total amount based on event.price and numTickets
    const priceNumeric = event.price ? parseInt(event.price.replace(/\D/g, '')) || 0 : 0;
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
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'contact@yogajam.fit',
            subject: 'New Booking Request - ' + event.title,
            type: 'admin_booking_notification',
            name: name,
            eventTitle: event.title,
            tickets: numTickets.toString(),
            amount: totalAmount,
          })
        })
      } catch (err) {
        console.error("Failed to send admin booking notification", err)
      }
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

  if (bookingType === "coming_soon") {
    return (
      <Button 
        size="lg" 
        variant="secondary" 
        className="w-full h-14 text-sm sm:text-base font-semibold opacity-70 cursor-not-allowed pointer-events-none"
      >
        Booking Opening Soon
      </Button>
    );
  }

  if (bookingType === "qr") {
    return (
      <>
        <Button onClick={() => setIsQRModalOpen(true)} size="lg" variant="primary" className="w-full h-14 text-sm sm:text-base font-semibold shadow-[0_0_20px_rgba(200,232,107,0.2)] hover:shadow-[0_0_30px_rgba(200,232,107,0.4)] transition-all">
          {buttonText}
        </Button>
      <BaseModal
        isOpen={isQRModalOpen}
        onClose={resetModal}
        title={isSubmitted ? "Request Sent" : (step === 1 ? "Your Details" : "Complete Your Payment")}
        maxWidthClass="max-w-2xl"
      >
        {!isSubmitted ? (
          <>
            <p className="text-sm text-text-secondary mb-6 text-center">
              {step === 1 
                ? "Please enter your details to reserve your spot." 
                : "Scan the QR code to pay, then upload a screenshot or enter your UTR number below."}
            </p>
            
            {step === 1 ? (
              <form onSubmit={handleNextStep} className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300" noValidate>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase">Full Name</label>
                  <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className={`w-full bg-background/80 border ${errors.name ? 'border-red-400/50' : 'border-border'} rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all`} />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase">Email Address</label>
                  <input type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full bg-background/80 border ${errors.email ? 'border-red-400/50' : 'border-border'} rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all`} />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase">Phone Number</label>
                  <input type="tel" placeholder="9876543210" value={contact} onChange={(e) => setContact(e.target.value.replace(/\D/g, '').slice(0, 10))} className={`w-full bg-background/80 border ${errors.contact ? 'border-red-400/50' : 'border-border'} rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all`} />
                  {errors.contact && <p className="text-red-400 text-xs mt-1">{errors.contact}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase">Number of Tickets</label>
                  <div className={`flex items-center gap-6 w-max bg-background/80 border ${errors.tickets ? 'border-red-400/50' : 'border-border'} rounded-xl px-4 py-2 transition-all`}>
                    <span className="text-xl font-bold text-foreground font-heading">{numTickets}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setNumTickets(Math.max(1, numTickets - 1))}
                        disabled={numTickets <= 1}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-foreground/ hover:bg-foreground/ active:scale-95 text-foreground disabled:opacity-30 disabled:hover:bg-foreground/ disabled:active:scale-100 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNumTickets(Math.min(10, numTickets + 1))}
                        disabled={numTickets >= 10}
                        className="w-10 h-10 flex items-center justify-center rounded-lg bg-foreground/ hover:bg-foreground/ active:scale-95 text-foreground disabled:opacity-30 disabled:hover:bg-foreground/ disabled:active:scale-100 transition-all"
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
                    <p className="text-sm text-text-secondary font-medium mb-1">Total Amount ({numTickets} {numTickets === 1 ? 'ticket' : 'tickets'})</p>
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

                <div className="flex gap-2 p-1 bg-foreground/ rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() => setVerifyMethod('screenshot')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${verifyMethod === 'screenshot' ? 'bg-accent text-background' : 'text-text-secondary hover:text-foreground'}`}
                  >
                    Screenshot
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerifyMethod('utr')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${verifyMethod === 'utr' ? 'bg-accent text-background' : 'text-text-secondary hover:text-foreground'}`}
                  >
                    UTR Number
                  </button>
                </div>

                <form onSubmit={handleQRSubmit} className="flex flex-col gap-4" noValidate>
                  {verifyMethod === 'screenshot' ? (
                    <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <label className="text-xs font-semibold text-text-secondary uppercase">Upload Screenshot</label>
                      <input key="file-input" type="file" accept="image/*" onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)} className="text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20 transition-all cursor-pointer" required />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <label className="text-xs font-semibold text-text-secondary uppercase">Enter UTR Number</label>
                      <input key="utr-input" type="text" placeholder="Enter 12-digit UTR / Transaction ID" value={utrNumber} onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))} pattern="\d{12}" title="UTR Number must be exactly 12 digits" className={`w-full bg-background/80 border ${errors.utr ? 'border-red-400/50' : 'border-border'} rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all`} />
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
            
            <p className="text-base md:text-lg text-text-secondary max-w-[80%] leading-relaxed mx-auto">
              Your journey begins here. We've received your request and our team will verify your payment and send your ticket shortly to <strong className="text-foreground font-semibold">{email}</strong>.
            </p>
          </div>
        )}
      </BaseModal>
      </>
    );
  }

  const platformEntries = Object.entries(links || {});
  const numLinks = platformEntries.length;

  if (numLinks === 0) {
    return (
      <Button size="lg" variant="primary" className="w-full h-14 text-sm sm:text-base font-semibold shadow-[0_0_20px_rgba(200,232,107,0.2)] hover:shadow-[0_0_30px_rgba(200,232,107,0.4)] transition-all">
        {buttonText}
      </Button>
    );
  }

  return (
    <>
      <Button 
        size="lg" 
        variant="primary" 
        onClick={() => setIsMobileMenuOpen(true)}
        className="w-full h-14 text-sm sm:text-base font-semibold shadow-[0_0_20px_rgba(200,232,107,0.2)] hover:shadow-[0_0_30px_rgba(200,232,107,0.4)] transition-all"
      >
        {buttonText}
      </Button>

      {/* Platform Selection Modal */}
      <BaseModal
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Choose Platform"
        maxWidthClass="max-w-md"
      >
        <div className="flex flex-col gap-3">
          {platformEntries.map(([name, url]) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between h-20 px-6 rounded-2xl border border-border bg-background/80 active:scale-95 transition-all hover:bg-foreground/20 hover:border-accent group/modalbtn"
            >
              <span className="font-heading font-bold text-xl text-foreground group-hover/modalbtn:text-accent transition-colors">{name}</span>
              <svg className="w-5 h-5 text-text-secondary group-hover/modalbtn:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          ))}
        </div>
      </BaseModal>
    </>
  );
}

function VideoWithLoader({ src }: { src: string }) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        document.querySelectorAll('video').forEach((vid) => {
          if (vid !== videoRef.current && !vid.paused) {
            vid.pause();
          }
        });
        videoRef.current.play();
      }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitEnterFullscreen) {
        (videoRef.current as any).webkitEnterFullscreen();
      }
    }
  };

  return (
    <div 
      className="relative w-full aspect-[9/16] sm:aspect-[4/5] md:aspect-[3/4] lg:aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-md border border-border group cursor-pointer"
      onClick={togglePlay}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/loader.svg" alt="Loading..." className="w-12 h-12 animate-pulse drop-shadow-xl" />
        </div>
      )}
      <video 
        ref={videoRef}
        src={`${src}#t=0.001`} 
        playsInline
        preload="metadata"
        muted={isMuted}
        onLoadedData={() => setIsLoading(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`} 
      />
      
      {/* Play/Pause Overlay */}
      {!isLoading && (
        <div className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-all duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
          <button 
            className="flex items-center justify-center text-white/90 hover:text-white hover:scale-110 transition-all duration-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? (
              <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            ) : (
              <svg className="w-14 h-14 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
        </div>
      )}

      {/* Bottom Controls */}
      {!isLoading && isPlaying && (
        <>
          <button
            onClick={toggleFullscreen}
            className="absolute bottom-4 left-4 z-30 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 hover:scale-110 transition-all duration-300 shadow-xl opacity-100 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Fullscreen"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>

          <button
            onClick={toggleMute}
            className="absolute bottom-4 right-4 z-30 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 hover:scale-110 transition-all duration-300 shadow-xl opacity-100 md:opacity-0 md:group-hover:opacity-100"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
        </>
      )}
    </div>
  );
}
