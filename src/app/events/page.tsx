import { createClient } from "@/utils/supabase/server";
import { EventsClient } from "./EventsClient";
import type { EventRecord } from "@/components/admin/EventsTable";

export const metadata = { title: "Events | YogaJam" };

export default async function EventsPage() {
  const supabase = await createClient()
  
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })

  return <EventsClient events={(events as EventRecord[]) || []} />;
}
