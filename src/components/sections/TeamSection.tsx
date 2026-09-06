"use client";

import * as React from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

import { teamMembersData as TEAM_MEMBERS } from "@/content/team";

export function TeamSection() {
  return (
    <section className="py-12 md:py-16 relative z-10 overflow-hidden bg-background">
      <Container>
        <div className="mb-10">
          <SectionHeading 
            title="The minds behind the jam"
            subtitle="We’ve got an entire team dedicated to making your experience unforgettable."
            align="left"
          />
        </div>

        <div className="flex items-center gap-4 md:gap-6 px-4 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-8 -mx-4 lg:mx-0 lg:px-0">
          {TEAM_MEMBERS.map((member) => (
            <div
              key={member.id}
              className="relative shrink-0 snap-center w-[55vw] sm:w-[35vw] md:w-[25vw] lg:w-[200px] transition-all duration-300 ease-out cursor-pointer group flex flex-col"
            >
              {/* Image Container */}
              <div className="relative w-full aspect-square md:aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden mb-3 md:mb-4">
                {/* Background gradient behind image just in case */}
                <div className="absolute inset-0 bg-surface-light/50" />

                {/* Image */}
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover filter md:grayscale opacity-90 md:group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                />
              </div>
              
              {/* Text Underneath */}
              <div className="text-left px-1">
                <h3 className="text-foreground font-bold text-sm sm:text-base md:text-lg whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-accent transition-colors">{member.name}</h3>
                <p className="text-foreground-secondary text-xs md:text-sm font-medium mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
