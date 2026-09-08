"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/utils/supabase/client";

export function ReviewModal({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    event: "",
    rating: 0,
    review: "",
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof typeof formData, string>>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const validate = () => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.event.trim()) newErrors.event = "Event attended is required.";
    if (formData.rating === 0) newErrors.rating = "Please select a rating.";
    if (!formData.review.trim()) {
      newErrors.review = "Please write a review.";
    } else if (formData.review.trim().length < 10) {
      newErrors.review = "Review must be at least 10 characters long.";
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
        .from('reviews')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            event: formData.event,
            rating: formData.rating,
            review: formData.review,
            status: 'pending'
          }
        ]);
        
      setIsSubmitting(false);
      
      if (error) {
        console.error("Supabase error:", error);
        setErrors(prev => ({ ...prev, review: "Failed to submit review. Please try again later." }));
      } else {
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: formData.email,
              subject: 'Thank you for your review!',
              type: 'review_thankyou',
              name: formData.name,
            })
          })
        } catch (err) {
          console.error("Failed to send review thank you email", err)
        }
        setIsSubmitted(true);
      }
    }
  };

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", event: "", rating: 0, review: "" });
      setErrors({});
    }, 300);
  };

  // Lock body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Handle ESC key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  return (
    <>
      <div onClick={(e) => { e.preventDefault(); setIsOpen(true); }} className="h-full w-full cursor-pointer">
        {children}
      </div>

      {isOpen && mounted && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-background/80 backdrop-blur-md transition-all duration-300 ease-out" 
          onClick={handleClose}
        >
          <div 
            className="relative w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden bg-surface sm:border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 sm:zoom-in-95 duration-300 ease-out" 
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="flex items-center justify-between p-6 border-b border-border shrink-0 bg-surface/80 backdrop-blur-xl z-10">
              <h2 className="text-xl md:text-2xl font-bold font-heading text-foreground">
                {isSubmitted ? "Review Submitted" : "Share Your Experience"}
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
              <div className="flex flex-col items-center justify-center min-h-[350px] py-12 text-center animate-in fade-in zoom-in-95 duration-500 ease-out">
                <h3 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-4 tracking-tight">
                  Thank <span className="text-accent-warm">You!</span>
                </h3>
                
                <p className="text-base md:text-lg text-foreground-secondary max-w-[80%] leading-relaxed mb-10">
                  Your feedback means the world to us. We're thrilled you had a great experience and can't wait to host you again!
                </p>
                <button 
                  onClick={handleClose}
                  className="bg-background border border-border hover:border-border text-foreground px-8 py-3 rounded-xl font-medium transition-all"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-foreground-secondary mb-8">
                  We'd love to hear how YogaJam moved you. Your story helps us grow and inspires others.
                </p>

                <form id="reviewForm" onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-xs font-semibold tracking-wide text-foreground-secondary uppercase">Name <span className="text-accent">*</span></label>
                      <input 
                        type="text" 
                        id="name" 
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className={`w-full bg-background/50 border ${errors.name ? 'border-red-400/50' : 'border-border'} rounded-xl px-4 py-3.5 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all`}
                        placeholder="Your full name"
                      />
                      {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-xs font-semibold tracking-wide text-foreground-secondary uppercase">Email <span className="text-accent">*</span></label>
                      <input 
                        type="email" 
                        id="email" 
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className={`w-full bg-background/50 border ${errors.email ? 'border-red-400/50' : 'border-border'} rounded-xl px-4 py-3.5 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all`}
                        placeholder="your@email.com"
                      />
                      {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="event" className="text-xs font-semibold tracking-wide text-foreground-secondary uppercase">Event Attended <span className="text-accent">*</span></label>
                    <input 
                      type="text" 
                      id="event" 
                      value={formData.event}
                      onChange={(e) => handleChange("event", e.target.value)}
                      className={`w-full bg-background/50 border ${errors.event ? 'border-red-400/50' : 'border-border'} rounded-xl px-4 py-3.5 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all`}
                      placeholder="e.g. Sunset Yoga Retreat"
                    />
                    {errors.event && <p className="text-red-400 text-xs mt-1">{errors.event}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold tracking-wide text-foreground-secondary uppercase">Rating <span className="text-accent">*</span></label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleChange("rating", star)}
                          className="focus:outline-none hover:scale-110 transition-transform"
                        >
                          <svg 
                            className={`w-8 h-8 ${formData.rating >= star ? 'text-accent-warm' : 'text-foreground/10'} transition-colors`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                    {errors.rating && <p className="text-red-400 text-xs mt-1">{errors.rating}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="review" className="text-xs font-semibold tracking-wide text-foreground-secondary uppercase">Your Review <span className="text-accent">*</span></label>
                    <textarea 
                      id="review" 
                      rows={5}
                      value={formData.review}
                      onChange={(e) => handleChange("review", e.target.value)}
                      className={`w-full bg-background/50 border ${errors.review ? 'border-red-400/50' : 'border-border'} rounded-xl px-4 py-3.5 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all resize-none`}
                      placeholder="Tell us about your experience..."
                    />
                    {errors.review && <p className="text-red-400 text-xs mt-1">{errors.review}</p>}
                  </div>

                </form>
              </>
            )}
            </div>

            {!isSubmitted && (
              <div className="p-6 border-t border-border bg-surface/50 shrink-0">
                <button 
                  type="submit"
                  form="reviewForm"
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
                    "Submit Review"
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
