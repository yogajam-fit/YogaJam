import * as React from "react";
import Image from "next/image";
import Link from "next/link";

interface EventCardProps {
  href: string;
  imageSrc: string;
  badgeText?: React.ReactNode;
  title: string;
  detail1Icon?: React.ReactNode;
  detail1Text?: string;
  detail2Icon?: React.ReactNode;
  detail2Text?: string;
  previewDesc: string;
  previewHighlight?: string;
  actionText?: string;
  heightClass?: string;
  containerClassName?: string;
}

export function EventCard({
  href,
  imageSrc,
  badgeText,
  title,
  detail1Icon,
  detail1Text,
  detail2Icon,
  detail2Text,
  previewDesc,
  previewHighlight,
  actionText = "Explore",
  heightClass = "md:h-[360px]",
  containerClassName = "",
}: EventCardProps) {
  return (
    <Link
      href={href}
      className={`group relative flex flex-col md:rounded-xl overflow-hidden transition-all duration-500 hover:-translate-y-2 ${heightClass} md:bg-[#050505] md:border md:border-border md:hover:border-accent/40 cursor-pointer ${containerClassName}`}
    >
      {/* Event Image Box (Square on mobile, absolute background on desktop) */}
      <div className="relative w-full aspect-square md:aspect-auto md:absolute md:inset-0 md:w-full md:h-full rounded-2xl md:rounded-none overflow-hidden bg-[#050505] border border-border md:border-none group-hover:border-accent/40 md:group-hover:border-none">
        <Image
          src={imageSrc}
          alt={title}
          fill
          unoptimized={true}
          className="object-cover transition-opacity duration-1000 opacity-80 md:opacity-60 group-hover:opacity-100 md:group-hover:opacity-30"
        />
        {/* Gradient only needed on desktop since mobile text is outside */}
        <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
        
        {/* Badge inside the image */}
        {badgeText && (
          <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-surface/80 backdrop-blur-md border border-border px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[9px] sm:text-[11px] font-semibold tracking-wider uppercase text-accent-warm z-10 transition-opacity duration-300 md:group-hover:opacity-0 flex items-center gap-1.5 md:gap-2">
            {badgeText}
          </div>
        )}
      </div>

      {/* Event Info - Below image on mobile, overlaid on desktop */}
      <div className="flex flex-col flex-1 mt-3 px-1 md:mt-0 md:relative md:justify-end md:p-6 md:z-10 md:overflow-hidden md:h-full">
        {/* Content Wrapper for Hover Crossfade */}
        <div className="relative w-full mb-1 md:mb-2">
          {/* Default State: Title, Details */}
          <div className="flex flex-col transition-all duration-500 ease-in-out md:group-hover:opacity-0 md:group-hover:-translate-y-4">
            <h3 className="text-base sm:text-lg md:text-2xl font-bold font-heading mb-1 md:mb-2 text-foreground leading-tight">{title}</h3>
            {(detail1Text || detail2Text) && (
              <>
                <div className="flex text-foreground-secondary text-[10px] sm:text-xs md:text-sm">
                  <span className="truncate">
                    {detail1Text && detail2Text ? `${detail1Text} • ${detail2Text}` : detail1Text || detail2Text}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="absolute top-0 left-0 w-full h-full hidden md:flex items-end opacity-0 translate-y-4 transition-all duration-500 ease-in-out group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none">
            <p className="text-foreground-secondary text-sm leading-relaxed whitespace-pre-wrap">
              {previewDesc}
              {previewHighlight && (
                <>
                  <br />
                  <span className="text-accent font-bold mt-1 inline-block">{previewHighlight}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Minimalist Button Link - Stays visible on desktop */}
        <div className="w-full hidden lg:flex items-center justify-between text-accent text-xs md:text-sm font-medium border-t border-border/50 md:border-border pt-2 md:pt-4 mt-2 md:group-hover:border-accent/50 transition-colors cursor-pointer relative z-20">
          <span className="tracking-wide">{actionText}</span>
          <svg className="w-3 h-3 md:w-4 md:h-4 transition-transform duration-300 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
