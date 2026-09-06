"use client";

import * as React from "react";
import { useState } from "react";

interface PreviewItem {
  id: string;
  image: string;
  title: string;
}

interface PreviewWheelProps {
  items: PreviewItem[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
}

export function PreviewWheel({ items, activeIndex, onActiveIndexChange }: PreviewWheelProps) {
  const [cumulativeIndex, setCumulativeIndex] = useState(0);
  const prevActiveIndexRef = React.useRef(activeIndex);
  const itemCount = 8; // Locked to 8 as requested

  // Ensure we only use up to 8 items
  const displayItems = items.slice(0, itemCount);

  // Fill with dummy items if we have less than 8
  while (displayItems.length < itemCount) {
    displayItems.push({
      id: `dummy-${displayItems.length}`,
      image: "/images/hero/hero-bg.jpg",
      title: "Placeholder"
    });
  }

  const angleStep = 360 / itemCount; // 45 degrees

  // React to activeIndex changes (e.g. from autoplay in parent)
  React.useEffect(() => {
    if (activeIndex !== prevActiveIndexRef.current) {
      let delta = activeIndex - prevActiveIndexRef.current;

      if (delta > itemCount / 2) {
        delta -= itemCount;
      } else if (delta < -itemCount / 2) {
        delta += itemCount;
      }

      setCumulativeIndex((prev) => prev + delta);
      prevActiveIndexRef.current = activeIndex;
    }
  }, [activeIndex, itemCount]);

  const handleItemClick = (targetIndex: number) => {
    // Just notify the parent, the useEffect will handle the cumulative rotation
    onActiveIndexChange(targetIndex);
  };

  return (
    <div className="absolute left-0 bottom-0 -translate-x-1/2 w-[400px] h-[400px] scale-[0.65] md:scale-[0.8] lg:scale-100 pointer-events-none z-30 origin-center transition-transform">
      <div
        className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{ transform: `rotate(${-cumulativeIndex * angleStep}deg)` }}
      >
        {displayItems.map((item, i) => {
          // Calculate position on the circle
          const angle = (i * angleStep) * (Math.PI / 180);
          const radius = 160; // Reduced radius
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          const isActive = i === activeIndex;

          return (
            <div
              key={item.id}
              className="absolute top-1/2 left-1/2 pointer-events-auto"
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${i * angleStep}deg)`
              }}
            >
              <div
                onClick={() => handleItemClick(i)}
                className={`w-24 h-12 backdrop-blur-md rounded-[14px] transition-all duration-500 cursor-pointer flex items-center justify-center group relative z-10 border overflow-hidden bg-cover bg-center
                  ${isActive
                    ? 'border-white/40 scale-110 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-110 z-20'
                    : 'bg-white/5 border-white/10 hover:bg-white/15 hover:border-white/20 hover:-translate-y-1 hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.02)] opacity-70 hover:opacity-100 hover:z-20'
                  }
                `}
                style={{ backgroundImage: `url("${item.image}")` }}
              >
                {/* Add a subtle overlay so the white line pops against the image background */}
                {isActive && <div className="absolute inset-0 bg-black/10"></div>}
                {!isActive && <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500"></div>}

              </div>
            </div>
          );
        })}
      </div>

      {/* Subtle center glow to tie the layout together */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
}
