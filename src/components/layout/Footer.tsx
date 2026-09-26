"use client";

import * as React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { createClient } from "@/utils/supabase/client";

import { contactData } from "@/content/contact";

const getSocialColor = (name: string) => {
  switch (name.toLowerCase()) {
    case "instagram": return "text-[#E1306C]";
    case "twitter": return "text-[#1DA1F2]";
    case "youtube": return "text-[#FF0000]";
    case "facebook": return "text-[#1877F2]";
    case "linkedin": return "text-[#0A66C2]";
    case "whatsapp": return "text-[#25D366]";
    default: return "text-foreground/80";
  }
};

export function Footer() {
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [socials, setSocials] = React.useState(contactData.socials);
  
  React.useEffect(() => {
    async function fetchSocials() {
      const supabase = createClient();
      const { data } = await supabase.from('social_links').select('*');
      if (data && data.length > 0) {
        // Map backend platform strings to local SVG paths
        const mappedSocials = data.map((item: any) => {
          const defaultSocial = contactData.socials.find(
            (s) => s.name.toLowerCase() === item.platform.toLowerCase()
          );
          
          return {
            name: item.platform.charAt(0).toUpperCase() + item.platform.slice(1),
            url: item.platform.toLowerCase() === 'whatsapp' && !item.url.startsWith('http') ? `https://wa.me/${item.url.replace(/[^0-9]/g, '')}` : item.url,
            path: defaultSocial?.path || (
              item.platform.toLowerCase() === 'linkedin' 
                ? 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z'
                : item.platform.toLowerCase() === 'whatsapp'
                ? 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z'
                : item.platform.toLowerCase() === 'youtube'
                ? 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'
                : item.platform.toLowerCase() === 'twitter'
                ? 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z'
                : item.platform.toLowerCase() === 'facebook'
                ? 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
                : 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z'
            )
          }
        });
        setSocials(mappedSocials);
      }
    }
    fetchSocials();
  }, []);

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
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-x-4 gap-y-12 md:gap-12 lg:gap-8 mb-20">
          
          {/* Brand & Socials Column */}
          <div className="hidden md:flex md:col-span-2 lg:col-span-4 flex-col justify-start">
            <Link href="/" className="inline-block mb-4">
              <span className="font-heading font-bold tracking-tight text-3xl text-foreground">YogaJam<span className="text-accent text-5xl leading-[0]">.</span></span>
            </Link>
            <p className="text-foreground-secondary text-sm leading-relaxed max-w-xs mb-8">
              We blend high-energy movement, deep house beats, and an electric community to create wellness experiences you actually want to show up for.
            </p>
            {/* Social Links (Desktop/Tablet Only in Footer) */}
            <div className="hidden md:flex items-center gap-5">
              {socials.map((social) => (
                <a 
                  key={social.name} 
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`hover:scale-110 transition-transform ${getSocialColor(social.name)}`}
                  aria-label={social.name}
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Explore Links */}
          <div className="md:col-span-1 lg:col-span-2 flex flex-col">
            <h4 className="text-foreground font-semibold text-base mb-6 font-heading">Explore</h4>
            <ul className="flex flex-col gap-4">
              {[
                { name: 'Upcoming events', href: '/events' },
                { name: 'Host event', href: '/personalized-events' },
                { name: 'Our team', href: '/team' },
                { name: 'Journal', href: '/journals' },
                { name: 'About us', href: '/about' }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-foreground-secondary hover:text-accent transition-colors text-sm whitespace-nowrap">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="md:col-span-1 lg:col-span-2 flex flex-col">
            <h4 className="text-foreground font-semibold text-base mb-6 font-heading">Support</h4>
            <ul className="flex flex-col gap-4">
              {[
                { name: 'FAQ', href: '/faq' },
                { name: 'Need help?', href: '/help' },
                { name: 'Terms of condition', href: '/terms' },
                { name: 'Privacy policy', href: '/privacy' }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-foreground-secondary hover:text-accent transition-colors text-sm whitespace-nowrap">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Minimal Newsletter */}
          <div className="col-span-2 lg:col-span-4 flex flex-col">
            <h4 className="text-foreground font-semibold text-base mb-6 font-heading">Subscribe to newsletter</h4>
            <p className="text-foreground-secondary text-sm mb-6 leading-relaxed">
              Get exclusive access to underground events and early retreat drops.
            </p>
            {status === 'success' ? (
              <div className="flex items-center gap-3 text-accent bg-accent/10 border border-accent/20 px-4 py-3 rounded-xl">
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
                  className={`w-full bg-surface/50 border ${status === 'error' ? 'border-red-500' : 'border-border'} rounded-xl px-4 py-3 text-sm text-foreground placeholder-foreground/40 focus:outline-none focus:border-accent focus:bg-surface transition-all`}
                  required
                />
                <button 
                  type="submit" 
                  disabled={status === 'loading'}
                  className="absolute right-2 top-2 bottom-2 aspect-square rounded-lg flex items-center justify-center text-foreground hover:text-black hover:bg-accent transition-colors disabled:opacity-70"
                  aria-label="Subscribe"
                >
                  {status === 'loading' ? (
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              </form>
            )}
            {status === 'error' && (
              <p className="text-red-400 text-xs mt-3">Failed to subscribe. Please try again.</p>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-border/50 pt-8">
          <p className="text-foreground-secondary text-xs font-medium">
            © {new Date().getFullYear()} YogaJam.fit. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
