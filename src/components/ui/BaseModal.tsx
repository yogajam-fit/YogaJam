"use client";

import * as React from "react";
import { createPortal } from "react-dom";

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  customHeader?: React.ReactNode;
  maxWidthClass?: string;
}

export function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  customHeader,
  maxWidthClass = "max-w-2xl"
}: BaseModalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4 bg-background/80 backdrop-blur-md transition-all duration-300 ease-out" 
      onClick={onClose}
    >
      <div 
        className={`relative w-full ${maxWidthClass} max-h-[95dvh] flex flex-col overflow-hidden bg-surface sm:border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 sm:zoom-in-95 duration-300 ease-out`}
        onClick={(e) => e.stopPropagation()}
      >
        {customHeader ? (
          customHeader
        ) : (
          <div className="flex items-center justify-between p-6 border-b border-border shrink-0 bg-surface/80 backdrop-blur-xl z-10">
            <h2 className="text-xl md:text-2xl font-bold font-heading text-foreground">
              {title}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 -mr-2 text-foreground-secondary hover:text-foreground transition-colors rounded-full hover:bg-foreground/5 bg-background/50 border border-border"
              aria-label="Close dialog"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar relative flex-1">
          {children}
        </div>

        {footer && (
          <div className="p-6 border-t border-border bg-surface/50 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
