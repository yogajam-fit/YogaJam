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

export default async function EventDetailPageWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase.from('events').select('*').eq('id', id).single();

  if (!event) {
    notFound();
  }
  
  return <EventDetailClient event={event} />;
}
