import * as React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export function EventNavigationCards() {
  return (
    <section className="py-6 md:py-8 relative z-10">
      {/* Gradient transition from transparent hero to solid background */}
      <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-transparent to-[#0B0D0C] -z-10 pointer-events-none" />
      <div className="absolute top-[150px] bottom-0 left-0 w-full bg-[#0B0D0C] -z-10 pointer-events-none" />
      
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Upcoming Events */}
          <Link 
            href="/events?tab=upcoming" 
            className="group relative overflow-hidden flex flex-col justify-center items-center h-28 md:h-40 rounded-2xl border border-border hover:scale-[1.03] transition-transform duration-300 bg-cover bg-center"
            style={{ backgroundImage: `url('https://ik.imagekit.io/yogajam/Buttons/5.png')` }}
          >
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />
            <h3 className="relative z-10 text-base sm:text-xl md:text-2xl font-bold font-heading text-white drop-shadow-lg text-center px-2">Upcoming Events</h3>
            <div className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </Link>
          
          {/* Past Events */}
          <Link 
            href="/events?tab=past" 
            className="group relative overflow-hidden flex flex-col justify-center items-center h-28 md:h-40 rounded-2xl border border-border hover:scale-[1.03] transition-transform duration-300 bg-cover bg-center"
            style={{ backgroundImage: `url('https://ik.imagekit.io/yogajam/Buttons/4.png')` }}
          >
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />
            <h3 className="relative z-10 text-base sm:text-xl md:text-2xl font-bold font-heading text-white drop-shadow-lg text-center px-2">Past Events</h3>
            <div className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </Link>

          {/* Host your event */}
          <div className="col-span-2 md:col-span-1 flex justify-center">
            <Link 
              href="/personalized-events" 
              className="w-[85%] sm:w-[60%] md:w-full group relative overflow-hidden flex flex-col justify-center items-center h-28 md:h-40 rounded-2xl border border-border hover:scale-[1.03] transition-transform duration-300 bg-cover bg-center"
              style={{ backgroundImage: `url('https://ik.imagekit.io/yogajam/Buttons/3.png')` }}
            >
              <div className="absolute inset-0 bg-black/40 pointer-events-none" />
              <h3 className="relative z-10 text-base sm:text-xl md:text-2xl font-bold font-heading text-white drop-shadow-lg text-center px-2">Host Your Event</h3>
              <div className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
