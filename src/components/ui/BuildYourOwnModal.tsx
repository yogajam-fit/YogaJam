"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { BaseModal } from "./BaseModal";
import { Button } from "./Button";
import { DatePicker } from "./DatePicker";
import { createClient } from "@/utils/supabase/client";

interface FormData {
  eventType: string;
  customEventType: string;
  groupSize: string;
  timeline: string;
  location: string;
  cityName: string;
  vision: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
}

const initialFormData: FormData = {
  eventType: "",
  customEventType: "",
  groupSize: "",
  timeline: "",
  location: "",
  cityName: "",
  vision: "",
  fullName: "",
  email: "",
  phone: "",
  company: "",
};

// Clean submission boundary
async function submitBuildYourOwnEvent(data: FormData) {
  const supabase = createClient();
  const { error } = await supabase
    .from('personalized_events')
    .insert([{
      type: 'build_your_own',
      name: data.fullName,
      email: data.email,
      phone: data.phone,
      group_size: data.groupSize,
      city: data.cityName,
      date_or_timeline: data.timeline,
      event_type: data.eventType === 'Something Else' ? data.customEventType : data.eventType,
      location_type: data.location,
      vision: data.vision
    }]);

  if (error) throw error;
}

export function BuildYourOwnModal({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <div onClick={(e) => { e.preventDefault(); setIsOpen(true); }} className="h-full w-full cursor-pointer">
        {children}
      </div>
      {isOpen && <ModalOverlay onClose={() => setIsOpen(false)} />}
    </>
  );
}

function ModalOverlay({ onClose }: { onClose: () => void }) {
  const [step, setStep] = React.useState<1 | 2 | "success">(1);
  const [formData, setFormData] = React.useState<FormData>(initialFormData);
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validateStep1 = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.eventType) newErrors.eventType = "Please select an event type.";
    if (formData.eventType === "Something Else" && !formData.customEventType.trim()) {
      newErrors.customEventType = "Please specify what you're planning.";
    }
    
    const size = parseInt(formData.groupSize, 10);
    if (!formData.groupSize) {
      newErrors.groupSize = "Group size is required.";
    } else if (isNaN(size) || size <= 0) {
      newErrors.groupSize = "Please enter a valid number greater than 0.";
    }

    if (!formData.timeline.trim()) newErrors.timeline = "Please provide a preferred date or timeline.";
    if (!formData.location.trim()) newErrors.location = "Please specify a preferred location type.";
    if (!formData.cityName.trim()) newErrors.cityName = "Please specify the city name.";
    if (!formData.vision.trim()) newErrors.vision = "Please tell us a bit about your vision.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required.";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Strict 10-digit phone validation
    const phoneClean = formData.phone.replace(/\D/g, "");
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (phoneClean.length !== 10) {
      newErrors.phone = "Please enter exactly 10 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
      setErrors({});
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (validateStep2()) {
      setIsSubmitting(true);
      try {
        await submitBuildYourOwnEvent(formData);
        
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: formData.email,
              subject: 'Your Request is Received!',
              type: 'host_confirmation',
              name: formData.fullName,
            })
          })

          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: 'contact@yogajam.fit',
              subject: 'New Build-Your-Own Event Request',
              type: 'admin_host_notification',
              name: formData.fullName,
              eventTitle: 'Build Your Own Event',
            })
          })
        } catch (err) {
          console.error("Failed to send emails", err)
        }
        
        setStep("success");
      } catch (err) {
        console.error("Submission failed", err);
        setErrors({ phone: "Something went wrong. Please try again." });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <BaseModal
      isOpen={true} // The rendering of ModalOverlay is controlled by BuildYourOwnModal's isOpen state
      onClose={onClose}
      title={step === "success" ? "Request Sent" : "Build Your Own Event"}
      maxWidthClass="max-w-2xl"
      customHeader={
        step !== "success" ? (
          <div className="flex items-center justify-between p-6 border-b border-border shrink-0 bg-surface/80 backdrop-blur-xl z-10">
            <div className="flex items-center gap-4">
              {step === 2 && (
                <button 
                  onClick={handleBack}
                  className="p-2 -ml-2 text-foreground-secondary hover:text-foreground transition-colors rounded-full hover:bg-foreground/"
                  aria-label="Go back to previous step"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
              )}
              <div>
                <h2 className="text-xl md:text-2xl font-bold font-heading text-foreground">
                  Build Your Own Event
                </h2>
                <p className="text-sm text-foreground-secondary mt-1 tracking-wide uppercase font-semibold">
                  Step {step} of 2
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 -mr-2 text-foreground-secondary hover:text-foreground transition-colors rounded-full hover:bg-foreground/ bg-background/80 border border-border"
              aria-label="Close dialog"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ) : undefined
      }
      footer={
        step !== "success" ? (
          step === 1 ? (
            <Button size="lg" variant="primary" onClick={handleNext} className="w-full text-base font-semibold h-14">
              Continue to Details
            </Button>
          ) : (
            <Button size="lg" variant="primary" onClick={handleSubmit} disabled={isSubmitting} className="w-full text-base font-semibold h-14 relative">
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Request"
              )}
            </Button>
          )
        ) : undefined
      }
    >
      {step === 1 && (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-left-4 duration-500">
          {/* Event Type */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-foreground tracking-wide uppercase" id="event-type-label">1. Type of Event <span className="text-accent">*</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-labelledby="event-type-label">
              {["Corporate", "Private Celebration", "Wellness Retreat", "Something Else"].map(type => (
                <button
                  key={type}
                  role="radio"
                  aria-checked={formData.eventType === type}
                  onClick={() => handleChange("eventType", type)}
                  className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                    formData.eventType === type 
                    ? "border-accent bg-accent/10 text-foreground" 
                    : "border-border bg-background/80 text-foreground-secondary hover:border-border hover:bg-foreground/"
                  }`}
                >
                  <div className="font-semibold text-sm">{type}</div>
                </button>
              ))}
            </div>
            {errors.eventType && <p className="text-red-400 text-sm mt-1">{errors.eventType}</p>}

            {/* Sub-field for Something Else */}
            {formData.eventType === "Something Else" && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                <input
                  type="text"
                  placeholder="Tell us what you're planning..."
                  value={formData.customEventType}
                  onChange={(e) => handleChange("customEventType", e.target.value)}
                  className={`w-full bg-background border ${errors.customEventType ? 'border-red-400/50' : 'border-border'} rounded-xl px-4 py-3.5 text-foreground placeholder:text-text-muted-accessible focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all`}
                />
                {errors.customEventType && <p className="text-red-400 text-sm mt-1.5">{errors.customEventType}</p>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Group Size */}
            <div className="space-y-2">
              <label htmlFor="groupSize" className="block text-sm font-semibold text-foreground tracking-wide uppercase">2. Expected Group Size <span className="text-accent">*</span></label>
              <input
                id="groupSize"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="e.g. 25"
                value={formData.groupSize}
                onChange={(e) => handleChange("groupSize", e.target.value.replace(/\D/g, ''))}
                className={`w-full bg-background border ${errors.groupSize ? 'border-red-400/50' : 'border-border'} rounded-xl px-4 py-3.5 text-foreground placeholder:text-text-muted-accessible focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all`}
              />
              {errors.groupSize && <p className="text-red-400 text-sm">{errors.groupSize}</p>}
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <label htmlFor="timeline" className="block text-sm font-semibold text-foreground tracking-wide uppercase">3. Preferred Date / Timeline <span className="text-accent">*</span></label>
              <DatePicker 
                value={formData.timeline}
                onChange={(val) => handleChange("timeline", val)}
                error={!!errors.timeline}
              />
              {errors.timeline && <p className="text-red-400 text-sm">{errors.timeline}</p>}
            </div>
          </div>

          {/* Location */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground tracking-wide uppercase">4. Where's it happening? <span className="text-accent">*</span></label>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" role="radiogroup">
                {[
                  { id: "My venue", icon: "🏠", title: "My venue", desc: "Home, terrace or society" },
                  { id: "Find me a venue", icon: "📍", title: "Find me a venue", desc: "We book our partner spaces" },
                  { id: "Outdoors", icon: "🌳", title: "Outdoors", desc: "Park, poolside or beach" }
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleChange("location", option.id)}
                    className={`flex flex-col text-left p-4 rounded-2xl border transition-all duration-300 ${
                      formData.location === option.id 
                        ? 'bg-accent/5 border-accent shadow-[0_0_15px_rgba(200,232,107,0.1)]' 
                        : 'bg-background border-border hover:border-border hover:bg-foreground/'
                    }`}
                    role="radio"
                    aria-checked={formData.location === option.id}
                  >
                    <span className="text-2xl mb-3">{option.icon}</span>
                    <span className="font-semibold text-foreground text-sm mb-1">{option.title}</span>
                    <span className="text-xs text-foreground-secondary">{option.desc}</span>
                  </button>
                ))}
              </div>
              {errors.location && <p className="text-red-400 text-sm">{errors.location}</p>}
            </div>

          {/* City Name */}
          <div className="space-y-2">
            <label htmlFor="cityName" className="block text-sm font-semibold text-foreground tracking-wide uppercase">5. City Name <span className="text-accent">*</span></label>
            <input
              id="cityName"
              type="text"
              placeholder="e.g. Mumbai, Bengaluru"
              value={formData.cityName}
              onChange={(e) => handleChange("cityName", e.target.value)}
              className={`w-full bg-background border ${errors.cityName ? 'border-red-400/50' : 'border-border'} rounded-xl px-4 py-3.5 text-foreground placeholder:text-text-muted-accessible focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all`}
            />
            {errors.cityName && <p className="text-red-400 text-sm">{errors.cityName}</p>}
          </div>

          {/* Vision */}
          <div className="space-y-2">
            <label htmlFor="vision" className="block text-sm font-semibold text-foreground tracking-wide uppercase">6. Your Vision <span className="text-accent">*</span></label>
            <textarea
              id="vision"
              rows={4}
              placeholder="Tell us what you're imagining — the vibe, people, music, movement, food, or anything else that matters."
              value={formData.vision}
              onChange={(e) => handleChange("vision", e.target.value)}
              className={`w-full bg-background border ${errors.vision ? 'border-red-400/50' : 'border-border'} rounded-xl px-4 py-3.5 text-foreground placeholder:text-text-muted-accessible focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none`}
            />
            {errors.vision && <p className="text-red-400 text-sm">{errors.vision}</p>}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <p className="text-foreground-secondary mb-2">Just a few details so our team can reach out and begin crafting your experience.</p>
          
          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm font-semibold text-foreground tracking-wide uppercase">Full Name <span className="text-accent">*</span></label>
            <input
              id="fullName"
              type="text"
              placeholder="Jane Doe"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              className={`w-full bg-background border ${errors.fullName ? 'border-red-400/50' : 'border-border'} rounded-xl px-4 py-3.5 text-foreground placeholder:text-text-muted-accessible focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all`}
            />
            {errors.fullName && <p className="text-red-400 text-sm">{errors.fullName}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-foreground tracking-wide uppercase">Email Address <span className="text-accent">*</span></label>
            <input
              id="email"
              type="email"
              placeholder="jane@example.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={`w-full bg-background border ${errors.email ? 'border-red-400/50' : 'border-border'} rounded-xl px-4 py-3.5 text-foreground placeholder:text-text-muted-accessible focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all`}
            />
            {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-semibold text-foreground tracking-wide uppercase">Phone Number <span className="text-accent">*</span></label>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="9876543210"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
              className={`w-full bg-background border ${errors.phone ? 'border-red-400/50' : 'border-border'} rounded-xl px-4 py-3.5 text-foreground placeholder:text-text-muted-accessible focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all`}
            />
            {errors.phone && <p className="text-red-400 text-sm">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="company" className="block text-sm font-semibold text-foreground tracking-wide uppercase">Company Name <span className="text-text-muted-accessible font-normal normal-case">(Optional)</span></label>
            <input
              id="company"
              type="text"
              placeholder="If applicable"
              value={formData.company}
              onChange={(e) => handleChange("company", e.target.value)}
              className={`w-full bg-background border border-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-text-muted-accessible focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all`}
            />
          </div>
        </div>
      )}

      {step === "success" && (
        <div className="flex flex-col items-center justify-center min-h-[350px] py-12 text-center animate-in fade-in zoom-in-95 duration-500 ease-out">
          <h3 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-4 tracking-tight">
            Vision <span className="text-accent-warm">Received!</span>
          </h3>
          
          <p className="text-base md:text-lg text-foreground-secondary max-w-[80%] leading-relaxed mb-10">
            Your journey begins here. We're incredibly excited about what you're planning, and our team will reach out shortly to start bringing this experience to life.
          </p>
          <Button size="lg" variant="outline" onClick={onClose} className="w-full sm:w-auto min-w-[200px]">
            Return to Events
          </Button>
        </div>
      )}
    </BaseModal>
  );
}
