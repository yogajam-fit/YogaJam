"use client";

import * as React from "react";
import { BaseModal } from "./BaseModal";

export function WaitlistModal({ children, cityName }: { children: React.ReactNode; cityName: string }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof typeof formData, string>>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const validate = () => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      // Simulate submission delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitting(false);
      setIsSubmitted(true);
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
      setFormData({ name: "", email: "" });
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
        title={isSubmitted ? "You're on the list!" : "Join Waitlist"}
        maxWidthClass="max-w-lg"
        footer={!isSubmitted && (
          <button 
            type="submit" 
            form="waitlistForm"
            disabled={isSubmitting}
            className="w-full bg-accent text-background font-bold text-sm tracking-wide rounded-xl py-4 shadow-[0_0_20px_rgba(200,232,107,0.2)] hover:shadow-[0_0_30px_rgba(200,232,107,0.4)] transition-all transform hover:-translate-y-1 relative"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Joining...
              </span>
            ) : (
              "Notify Me"
            )}
          </button>
        )}
      >
        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center min-h-[250px] py-8 text-center animate-in fade-in zoom-in-95 duration-500 ease-out">
            <h3 className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-4 tracking-tight">
              Can't wait to see you in <span className="text-accent-warm">{cityName}</span>
            </h3>
            
            <p className="text-base text-text-secondary leading-relaxed">
              We'll notify you the moment YogaJam tickets go live in your city. Get ready to move.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-text-secondary mb-6">
              Be the first to know when YogaJam launches in <strong>{cityName}</strong>.
            </p>

            <form id="waitlistForm" onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs font-semibold tracking-wide text-text-secondary uppercase">Name</label>
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
                <label htmlFor="email" className="text-xs font-semibold tracking-wide text-text-secondary uppercase">Email</label>
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
            </form>
          </>
        )}
      </BaseModal>
    </>
  );
}
