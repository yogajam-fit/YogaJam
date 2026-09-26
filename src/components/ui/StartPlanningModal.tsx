"use client";

import * as React from "react";
import { BaseModal } from "./BaseModal";
import { DatePicker } from "./DatePicker";
import { createClient } from "@/utils/supabase/client";

export function StartPlanningModal({ children, eventTitle }: { children: React.ReactNode; eventTitle: string }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: "",
    contact: "",
    email: "",
    groupSize: "",
    city: "",
    date: "",
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof typeof formData, string>>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const validate = () => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    
    // Strict 10-digit phone validation
    const phoneClean = formData.contact.replace(/\D/g, "");
    if (!formData.contact.trim()) {
      newErrors.contact = "Contact number is required.";
    } else if (phoneClean.length !== 10) {
      newErrors.contact = "Please enter exactly 10 digits.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    const size = parseInt(formData.groupSize, 10);
    if (!formData.groupSize) {
      newErrors.groupSize = "Group size is required.";
    } else if (isNaN(size) || size <= 0) {
      newErrors.groupSize = "Please enter a valid number greater than 0.";
    }

    if (!formData.city.trim()) newErrors.city = "City is required.";

    if (!formData.date) {
      newErrors.date = "Please select a date.";
    } else {
      const [y, m, d] = formData.date.split('-');
      const selected = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        newErrors.date = "Please select a future date.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      
      const supabase = createClient();
      const { error } = await supabase
        .from('personalized_events')
        .insert([{
          type: 'start_planning',
          name: formData.name,
          email: formData.email,
          phone: formData.contact,
          group_size: formData.groupSize,
          city: formData.city,
          date_or_timeline: formData.date,
          event_title: eventTitle
        }]);
        
      setIsSubmitting(false);
      
      if (error) {
        setErrors({ date: "Something went wrong. Please try again." });
      } else {
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: formData.email,
              subject: 'Your Request is Received!',
              type: 'host_confirmation',
              name: formData.name,
            })
          })

          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: 'contact@yogajam.fit',
              subject: 'New Host Request - ' + eventTitle,
              type: 'admin_host_notification',
              name: formData.name,
              eventTitle: eventTitle,
            })
          })
        } catch (err) {
          console.error("Failed to send emails", err)
        }
        setIsSubmitted(true);
      }
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", contact: "", email: "", groupSize: "", city: "", date: "" });
      setErrors({});
    }, 300);
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="w-full cursor-pointer">
        {children}
      </div>

      <BaseModal
        isOpen={isOpen}
        onClose={handleClose}
        title={isSubmitted ? "Request Sent" : "Start Planning"}
        maxWidthClass="max-w-2xl"
        footer={!isSubmitted && (
          <button 
            type="submit" 
            form="startPlanningForm"
            disabled={isSubmitting}
            className="w-full bg-accent text-background font-bold text-sm tracking-wide rounded-xl py-4 shadow-[0_0_20px_rgba(200,232,107,0.2)] hover:shadow-[0_0_30px_rgba(200,232,107,0.4)] transition-all transform hover:-translate-y-1 relative"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Request"
            )}
          </button>
        )}
      >
        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center min-h-[350px] py-12 text-center animate-in fade-in zoom-in-95 duration-500 ease-out">
            <h3 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-4 tracking-tight">
              Thank <span className="text-accent-warm">You!</span>
            </h3>
            
            <p className="text-base md:text-lg text-foreground-secondary max-w-[80%] leading-relaxed">
              Your journey begins here. We've received your request and our team will reach out shortly to start crafting your unforgettable <strong className="text-foreground font-semibold">{eventTitle}</strong>.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-foreground-secondary mb-6">
              Let's craft your perfect {eventTitle}. Fill out the details below and we'll get back to you.
            </p>

            <form id="startPlanningForm" onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-semibold tracking-wide text-foreground-secondary uppercase">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={`w-full bg-background/80 border ${errors.name ? 'border-red-400/50' : 'border-border'} rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all`}
                    placeholder="Your name"
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="contact" className="text-xs font-semibold tracking-wide text-foreground-secondary uppercase">Contact Number</label>
                  <input 
                    type="tel" 
                    id="contact" 
                    inputMode="numeric"
                    maxLength={10}
                    value={formData.contact}
                    onChange={(e) => handleChange("contact", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className={`w-full bg-background/80 border ${errors.contact ? 'border-red-400/50' : 'border-border'} rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all`}
                    placeholder="9876543210"
                  />
                  {errors.contact && <p className="text-red-400 text-xs mt-1">{errors.contact}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold tracking-wide text-foreground-secondary uppercase">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`w-full bg-background/80 border ${errors.email ? 'border-red-400/50' : 'border-border'} rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all`}
                  placeholder="your@email.com"
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="city" className="text-xs font-semibold tracking-wide text-foreground-secondary uppercase">City</label>
                <input 
                  type="text" 
                  id="city" 
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className={`w-full bg-background/80 border ${errors.city ? 'border-red-400/50' : 'border-border'} rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all`}
                  placeholder="e.g. Bengaluru"
                />
                {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="groupSize" className="text-xs font-semibold tracking-wide text-foreground-secondary uppercase">Group Size</label>
                  <input 
                    type="text" 
                    id="groupSize" 
                    inputMode="numeric"
                    value={formData.groupSize}
                    onChange={(e) => handleChange("groupSize", e.target.value.replace(/\D/g, ''))}
                    className={`w-full bg-background/80 border ${errors.groupSize ? 'border-red-400/50' : 'border-border'} rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all`}
                    placeholder="Estimated number of people"
                  />
                  {errors.groupSize && <p className="text-red-400 text-xs mt-1">{errors.groupSize}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="date" className="text-xs font-semibold tracking-wide text-foreground-secondary uppercase">Date</label>
                  <DatePicker 
                    value={formData.date}
                    onChange={(val) => handleChange("date", val)}
                    error={!!errors.date}
                  />
                  {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
                </div>
              </div>
            </form>
          </>
        )}
      </BaseModal>
    </>
  );
}
