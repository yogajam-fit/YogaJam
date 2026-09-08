"use client";

import * as React from "react";
import { createPortal } from "react-dom";

export function WaitlistModal({ children, cityName }: { children: React.ReactNode; cityName: string }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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

      {isOpen && mounted && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-background/80 backdrop-blur-md transition-all duration-300 ease-out" 
          onClick={handleClose}
        >
          <div 
            className="relative w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden bg-surface sm:border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 sm:zoom-in-95 duration-300 ease-out" 
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="flex items-center justify-between p-6 border-b border-border shrink-0 bg-surface/80 backdrop-blur-xl z-10">
              <h2 className="text-xl md:text-2xl font-bold font-heading text-foreground">
                {isSubmitted ? "You're on the list!" : "Join Waitlist"}
              </h2>
              <button 
                onClick={handleClose}
                className="p-2 -mr-2 text-foreground-secondary hover:text-foreground transition-colors rounded-full hover:bg-foreground/5 bg-background/50 border border-border"
                aria-label="Close dialog"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar relative flex-1">

            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center min-h-[250px] py-8 text-center animate-in fade-in zoom-in-95 duration-500 ease-out">
                <h3 className="text-2xl md:text-3xl font-bold font-heading text-foreground mb-4 tracking-tight">
                  Can't wait to see you in <span className="text-accent-warm">{cityName}</span>
                </h3>
                
                <p className="text-base text-foreground-secondary leading-relaxed">
                  We'll notify you the moment YogaJam tickets go live in your city. Get ready to move.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-foreground-secondary mb-6">
                  Be the first to know when YogaJam launches in <strong>{cityName}</strong>.
                </p>

                <form id="waitlistForm" onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-xs font-semibold tracking-wide text-foreground-secondary uppercase">Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className={`w-full bg-background/50 border ${errors.name ? 'border-red-400/50' : 'border-border'} rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all`}
                      placeholder="Your name"
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                  </div>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-semibold tracking-wide text-foreground-secondary uppercase">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className={`w-full bg-background/50 border ${errors.email ? 'border-red-400/50' : 'border-border'} rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all`}
                      placeholder="your@email.com"
                    />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                  </div>
                </form>
              </>
            )}
            </div>

            {!isSubmitted && (
              <div className="p-6 border-t border-border bg-surface/50 shrink-0">
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
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
