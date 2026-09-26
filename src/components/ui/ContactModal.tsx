"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { BaseModal } from "./BaseModal";
import { contactData } from "@/content/contact";

export function ContactIcons() {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const actions = [
    {
      id: "phone",
      label: "Call",
      href: `tel:${contactData.phone}`,
      color: "#C8E86B",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
    {
      id: "whatsapp",
      label: "Message",
      href: `https://wa.me/${contactData.whatsapp.replace(/\D/g, "")}`,
      target: "_blank",
      color: "#25D366",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
    },
    {
      id: "email",
      label: "Email",
      href: `mailto:${contactData.email}`,
      color: "#60a5fa",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <div
        className="relative w-full h-14 rounded-xl border border-border cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsMobileMenuOpen(true)}
      >
        {/* Default: text label */}
      <div
        className="absolute inset-0 flex items-center justify-center text-foreground-secondary text-sm md:text-base font-medium px-2 text-center"
        style={{
          opacity: isHovered ? 0 : 1,
          transform: isHovered ? "translateY(-8px)" : "translateY(0)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <span className="hidden lg:inline">Contact Organizer</span>
        <span className="inline lg:hidden">Contact</span>
      </div>

      {/* Hover: 3 icons inside the same border (Desktop Only - lg and up) */}
      <div
        className="absolute inset-0 hidden lg:flex items-center justify-center gap-3 sm:gap-6 md:gap-8"
        style={{
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? "translateY(0)" : "translateY(8px)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {actions.map((action, i) => (
          <IconWithTooltip key={action.id} action={action} delay={i * 0.04} />
        ))}
      </div>
      </div>
      
      {/* Mobile & Tablet Popover Bottom Sheet */}
      <BaseModal
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Contact Organizer"
        maxWidthClass="max-w-md"
      >
        <div className="flex flex-col gap-3">
          {actions.map(action => (
            <a 
              key={action.id} 
              href={action.href} 
              target={"target" in action ? action.target : undefined}
              className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-background/80 active:scale-95 transition-all hover:bg-foreground/"
            >
              <div className="w-12 h-12 rounded-full flex flex-shrink-0 items-center justify-center bg-surface border border-border" style={{ color: action.color }}>
                {action.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold text-foreground tracking-wide">{action.label}</span>
                <span className="text-xs text-foreground-secondary mt-0.5">
                  {action.id === 'phone' ? contactData.phone : action.id === 'whatsapp' ? 'Chat on WhatsApp' : contactData.email}
                </span>
              </div>
            </a>
          ))}
        </div>
      </BaseModal>
    </>
  );
}

function IconWithTooltip({ action, delay }: { action: { id: string; label: string; href: string; target?: string; color: string; icon: React.ReactNode }; delay: number }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <a
      href={action.href}
      target={"target" in action ? action.target : undefined}
      rel={"target" in action ? "noopener noreferrer" : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center justify-center gap-1.5 rounded-lg overflow-hidden"
      style={{
        color: action.color,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Icon */}
      <span
        style={{
          transform: hovered ? "scale(1.2)" : "scale(1)",
          transition: "transform 0.25s ease",
          flexShrink: 0,
        }}
      >
        {action.icon}
      </span>

      {/* Expanding label to the right */}
      <span
        className="text-[11px] font-semibold tracking-widest uppercase whitespace-nowrap overflow-hidden"
        style={{
          maxWidth: hovered ? "60px" : "0px",
          opacity: hovered ? 1 : 0,
          transition: "max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease",
        }}
      >
        {action.label}
      </span>
    </a>
  );
}

export { ContactIcons as ContactModal };
