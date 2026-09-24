"use client";

import * as React from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

import { teamMembersData as TEAM_MEMBERS } from "@/content/team";

export function TeamSection() {
  return (
    <section className="relative z-10 overflow-hidden bg-background">

      <Container>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 lg:gap-8 pb-8">
          {TEAM_MEMBERS.map((member) => {
            const isSvg = member.image.endsWith('.svg');
            return (
            <div
              key={member.id}
              className="relative w-full transition-all duration-300 ease-out cursor-pointer group flex flex-col"
            >
              {/* Image Container */}
              <div className={`relative w-full aspect-square md:aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden mb-3 md:mb-4 ${isSvg ? 'bg-surface/50 border border-border/50' : 'bg-surface-light/50'}`}>
                {/* Image */}
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={`transition-all duration-500 ${
                    isSvg 
                      ? 'object-contain p-8 md:p-10 opacity-50 invert hover:opacity-70 group-hover:scale-105' 
                      : 'object-cover filter md:grayscale opacity-90 md:group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105'
                  }`}
                />
              </div>
              
              {/* Text Underneath */}
              <div className="text-left px-1">
                <h3 className="text-foreground font-bold text-sm sm:text-base md:text-lg whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-accent transition-colors">{member.name}</h3>
                <p className="text-foreground-secondary text-xs md:text-sm font-medium mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{member.role}</p>
              </div>
            </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
