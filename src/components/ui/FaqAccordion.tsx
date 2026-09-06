"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        
        return (
          <div 
            key={index} 
            className="border border-white/5 rounded-2xl bg-surface/50 overflow-hidden transition-colors hover:border-white/10"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="text-lg md:text-xl font-bold text-white pr-8 font-heading leading-tight">{item.question}</span>
              <div 
                className={cn(
                  "w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 transition-transform duration-300",
                  isOpen ? "rotate-45 bg-accent/20" : "rotate-0"
                )}
              >
                <svg className={cn("w-5 h-5 transition-colors duration-300", isOpen ? "text-accent" : "text-white/60")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </button>
            <div 
              className="grid transition-all duration-300 ease-in-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="p-6 pt-0 text-foreground-secondary leading-relaxed">
                  {item.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
