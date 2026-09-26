"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  error?: boolean;
  popDirection?: 'up' | 'down';
  allowPastDates?: boolean;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DatePicker({ value, onChange, className, error, popDirection = 'up', allowPastDates = false }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Use today as default if no value, otherwise parse local date
  const [currentDate, setCurrentDate] = React.useState(() => {
    if (value) {
      const [y, m, d] = value.split('-');
      return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    }
    return new Date();
  });
  
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const handleDayClick = (day: number) => {
    const yyyy = year;
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const handlePrev = (e: React.MouseEvent) => { 
    e.preventDefault(); 
    e.stopPropagation();
    setCurrentDate(new Date(year, month - 1, 1)); 
  };
  const handleNext = (e: React.MouseEvent) => { 
    e.preventDefault(); 
    e.stopPropagation();
    setCurrentDate(new Date(year, month + 1, 1)); 
  };

  const displayValue = value ? (() => {
      const [y, m, d] = value.split('-');
      const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  })() : "Select a date";

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-background/80 border rounded-xl px-4 py-3 text-sm flex items-center justify-between cursor-pointer transition-all",
          error ? "border-red-400/50" : "border-border hover:border-border",
          isOpen && "border-accent/50 ring-1 ring-accent/50",
          className
        )}
      >
        <span className={value ? "text-foreground" : "text-text-muted-accessible"}>
          {displayValue}
        </span>
        <svg className="w-4 h-4 text-foreground-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      {isOpen && (
        <div className={cn(
          "absolute left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-0 sm:right-auto p-4 bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl z-50 w-[280px] animate-in fade-in",
          popDirection === 'up' 
            ? "bottom-full mb-2 slide-in-from-bottom-2" 
            : "top-full mt-2 slide-in-from-top-2"
        )}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrev} className="p-1.5 bg-foreground/ hover:bg-foreground/ rounded-lg transition-colors text-foreground-secondary hover:text-foreground">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
            </button>
            <div className="text-sm font-semibold text-foreground tracking-wide">
              {MONTHS[month]} {year}
            </div>
            <button onClick={handleNext} className="p-1.5 bg-foreground/ hover:bg-foreground/ rounded-lg transition-colors text-foreground-secondary hover:text-foreground">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2 text-center">
            {DAYS.map(d => <div key={d} className="text-[10px] uppercase font-bold text-text-muted-accessible">{d}</div>)}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = value === dateStr;
              
              const currentDayObj = new Date(year, month, day);
              const todayObj = new Date();
              todayObj.setHours(0, 0, 0, 0);
              const isPast = !allowPastDates && currentDayObj < todayObj;
              
              return (
                <button
                  key={day}
                  onClick={(e) => { 
                    e.preventDefault(); 
                    if (!isPast) handleDayClick(day); 
                  }}
                  disabled={isPast}
                  className={cn(
                    "h-8 w-8 flex items-center justify-center rounded-full text-xs font-medium transition-all duration-200 mx-auto",
                    isSelected 
                      ? "bg-accent text-background font-bold shadow-[0_0_10px_rgba(200,232,107,0.3)]" 
                      : isPast
                        ? "text-foreground-secondary/30 cursor-not-allowed"
                        : "text-foreground hover:bg-foreground/10 hover:text-accent-warm"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
