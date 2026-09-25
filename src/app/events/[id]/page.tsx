import { EventDetailClient } from "./EventDetailClient";
import * as React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { createPortal } from "react-dom";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ContactIcons } from "@/components/ui/ContactModal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { createClient } from "@/utils/supabase/server";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase.from('events').select('*').eq('id', id).single();

  if (!event) {
    return {
      title: "Event Not Found",
      description: "The event you are looking for does not exist.",
    };
  }

  const title = `${event.title} | YogaJam Events`;
  const description = event.description || `Join us for ${event.title} in ${event.location || 'Bengaluru'}.`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: event.image_url ? [event.image_url] : [],
      type: "website",
    },
  };
}

export default async function EventDetailPageWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase.from('events').select('*').eq('id', id).single();

  if (!event) {
    notFound();
  }
  
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "startDate": event.date,
    "endDate": event.date,
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled",
    "location": {
      "@type": "Place",
      "name": event.location || "YogaJam Venue",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": event.city || "Bengaluru",
        "addressCountry": "IN"
      }
    },
    "image": event.image_url ? [event.image_url] : [],
    "description": event.description || event.title,
    "organizer": {
      "@type": "Organization",
      "name": "YogaJam",
      "url": "https://yogajam.fit"
    }
  };

  return (
    <>
      <JsonLd data={eventSchema} />
      <EventDetailClient event={event} />
    </>
  );
}
