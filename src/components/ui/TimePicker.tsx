"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  error?: boolean;
  popDirection?: 'up' | 'down';
}

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
const AMPM = ["AM", "PM"];

export function TimePicker({ value, onChange, className, error, popDirection = 'up' }: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Parse initial value or use defaults
  const parsed = React.useMemo(() => {
    if (!value) return { h: "12", m: "00", a: "PM" };
    const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (match) {
      return { 
        h: String(parseInt(match[1])).padStart(2, '0'), 
        m: match[2], 
        a: match[3].toUpperCase() 
      };
    }
    return { h: "12", m: "00", a: "PM" };
  }, [value]);

  const [hour, setHour] = React.useState(parsed.h);
  const [minute, setMinute] = React.useState(parsed.m);
  const [ampm, setAmpm] = React.useState(parsed.a);

  React.useEffect(() => {
    if (isOpen) {
      setHour(parsed.h);
      setMinute(parsed.m);
      setAmpm(parsed.a);
    }
  }, [isOpen, parsed]);

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

  const handleApply = () => {
    onChange(`${hour}:${minute} ${ampm}`);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-background/50 border rounded-xl px-4 py-3 text-sm flex items-center justify-between cursor-pointer transition-all",
          error ? "border-red-400/50" : "border-border hover:border-border",
          isOpen && "border-accent/50 ring-1 ring-accent/50",
          className
        )}
      >
        <span className={value ? "text-foreground" : "text-foreground-secondary/70"}>
          {value || "Select time"}
        </span>
        <svg className="w-4 h-4 text-foreground-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      {isOpen && (
        <div className={cn(
          "absolute left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-0 sm:right-auto p-4 bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl z-50 w-[240px] animate-in fade-in",
          popDirection === 'up' 
            ? "bottom-full mb-2 slide-in-from-bottom-2" 
            : "top-full mt-2 slide-in-from-top-2"
        )}>
          <div className="flex justify-between items-center h-40 mb-4 bg-background/20 rounded-xl p-2 border border-border">
            {/* Hours */}
            <div className="flex-1 h-full overflow-y-auto snap-y snap-mandatory px-1 text-center relative scroll-smooth mask-image-fade [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="h-[40%]" /> {/* Spacer */}
              {HOURS.map(h => (
                <div 
                  key={`h-${h}`} 
                  onClick={() => setHour(h)}
                  className={cn(
                    "h-8 flex items-center justify-center snap-center cursor-pointer transition-all duration-200 text-sm font-medium rounded-lg",
                    hour === h ? "bg-accent/20 text-accent font-bold" : "text-foreground-secondary hover:text-foreground"
                  )}
                >
                  {h}
                </div>
              ))}
              <div className="h-[40%]" />
            </div>
            
            <div className="text-foreground-secondary font-bold">:</div>
            
            {/* Minutes */}
            <div className="flex-1 h-full overflow-y-auto snap-y snap-mandatory px-1 text-center relative scroll-smooth mask-image-fade [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="h-[40%]" />
              {MINUTES.map(m => (
                <div 
                  key={`m-${m}`} 
                  onClick={() => setMinute(m)}
                  className={cn(
                    "h-8 flex items-center justify-center snap-center cursor-pointer transition-all duration-200 text-sm font-medium rounded-lg",
                    minute === m ? "bg-accent/20 text-accent font-bold" : "text-foreground-secondary hover:text-foreground"
                  )}
                >
                  {m}
                </div>
              ))}
              <div className="h-[40%]" />
            </div>

            <div className="w-px h-full bg-foreground/10 mx-1" />

            {/* AM/PM */}
            <div className="flex-1 h-full flex flex-col justify-center gap-2 px-1">
              {AMPM.map(a => (
                <div 
                  key={`a-${a}`} 
                  onClick={() => setAmpm(a)}
                  className={cn(
                    "h-10 flex items-center justify-center cursor-pointer transition-all duration-200 text-xs font-bold rounded-lg",
                    ampm === a ? "bg-accent text-background shadow-[0_0_10px_rgba(200,232,107,0.3)]" : "bg-foreground/5 text-foreground-secondary hover:bg-foreground/10 hover:text-foreground"
                  )}
                >
                  {a}
                </div>
              ))}
            </div>
          </div>
          
          <button 
            type="button"
            onClick={handleApply}
            className="w-full bg-foreground/10 hover:bg-foreground/ text-foreground font-bold py-2.5 rounded-xl transition-colors text-sm"
          >
            Apply Time
          </button>
        </div>
      )}
    </div>
  );
}
