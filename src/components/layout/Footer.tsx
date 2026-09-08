"use client";

import * as React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { createClient } from "@/utils/supabase/client";

import { contactData } from "@/content/contact";

export function Footer() {
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    const supabase = createClient();
    
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email: email.trim(), source: 'footer_newsletter' }]);
      
    if (error) {
      if (error.code === '23505') {
        setStatus('success'); // Already subscribed
      } else {
        setStatus('error');
      }
    } else {
      // Send the thank you email
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email.trim(),
            subject: 'Welcome to YogaJam!',
            type: 'newsletter_subscribe',
            name: email.split('@')[0], // simple fallback for name
          }),
        })
      } catch (err) {
        console.error("Failed to send welcome email", err)
      }

      setStatus('success');
    }
  };

  return (
    <footer className="bg-background pt-20 pb-10 relative z-10 overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
          
          {/* Brand */}
          <div className="md:col-span-2 lg:col-span-4 flex flex-col justify-between">
            <div>
              <Link href="/" className="text-3xl font-bold font-heading tracking-tight text-foreground mb-4 block">
                YogaJam<span className="text-accent">.</span>
              </Link>
              <p className="text-foreground-secondary text-sm font-medium tracking-wide mb-8">
                Movement. Music. Connection.
              </p>
              
              <div className="flex items-center gap-5">
                {contactData.socials.map((social) => (
                  <a 
                    key={social.name} 
                    href={social.url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground/40 hover:text-foreground transition-colors"
                    aria-label={social.name}
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-1 lg:col-span-4 flex gap-12 sm:gap-16">
            <ul className="flex flex-col gap-4">
              {[
                { name: 'Upcoming events', href: '/events' },
                { name: 'Host event', href: '/personalized-events' },
                { name: 'Cities', href: '/cities' },
                { name: 'Journal', href: '/journals' },
                { name: 'About us', href: '/about' }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-foreground-secondary hover:text-foreground transition-colors text-sm whitespace-nowrap">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="flex flex-col gap-4">
              {[
                { name: 'FAQ', href: '/faq' },
                { name: 'Need help?', href: '/help' },
                { name: 'Terms of condition', href: '/terms' },
                { name: 'Privacy policy', href: '/privacy' }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-foreground-secondary hover:text-foreground transition-colors text-sm whitespace-nowrap">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Minimal Newsletter */}
          <div className="md:col-span-1 lg:col-span-4 flex flex-col">
            <h4 className="text-foreground font-medium text-base mb-2">Subscribe to newsletter</h4>
            <p className="text-foreground/40 text-sm mb-6 leading-relaxed">
              Get exclusive access to underground events and early retreat drops.
            </p>
            {status === 'success' ? (
              <div className="flex items-center gap-2 text-accent bg-accent/10 border border-accent/20 px-4 py-3 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">You're on the list!</span>
              </div>
            ) : (
              <form className="relative group" onSubmit={handleSubscribe}>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address" 
                  className={`w-full bg-transparent border-b ${status === 'error' ? 'border-red-500' : 'border-border'} pb-3 text-sm text-foreground placeholder-white/40 focus:outline-none focus:border-accent transition-colors`}
                  required
                />
                <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  className="absolute right-0 top-0 bottom-3 flex items-center justify-center text-foreground/40 group-hover:text-accent transition-colors disabled:opacity-50"
                  aria-label="Subscribe"
                >
                  {status === 'loading' ? (
                    <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              </form>
            )}
            {status === 'error' && (
              <p className="text-red-400 text-xs mt-2">Failed to subscribe. Please try again.</p>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-foreground/40 text-xs">
            © {new Date().getFullYear()} YogaJam. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
