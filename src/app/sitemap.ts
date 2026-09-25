import { MetadataRoute } from 'next'
import { createClient } from "@/utils/supabase/server"
import { journals } from "@/content/journals"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://yogajam.fit'
  const supabase = await createClient()

  // Fetch events
  const { data: events } = await supabase.from('events').select('id, updated_at')

  const sitemap: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/journals`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    // More static pages here as needed
  ]

  // Add event pages
  if (events) {
    for (const event of events) {
      sitemap.push({
        url: `${baseUrl}/events/${event.id}`,
        lastModified: event.updated_at ? new Date(event.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  }

  // Add journal pages
  if (journals) {
    for (const journal of journals) {
      sitemap.push({
        url: `${baseUrl}/journals/${journal.id}`,
        lastModified: new Date(journal.date),
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  }

  return sitemap
}
