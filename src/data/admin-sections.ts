import { db } from '@/db'
import { events, sections } from '@/db/schema'
import { requireAdmin } from '@/lib/auth/dal'
import { parsePlaces, type Place } from '@/lib/places'
import {
  isSectionType,
  sectionCatalog,
  type SectionType,
} from '@/sections/catalog'
import { asc, eq } from 'drizzle-orm'

export interface AdminSection {
  id: string
  type: SectionType
  variant: string | null
  enabled: boolean
  data: unknown
  /** Data passes the section schema, so the invitation shows it. */
  complete: boolean
}

export interface AdminSectionsPage {
  event: {
    id: string
    slug: string
    title: string
    status: string
    places: Place[]
  }
  sections: AdminSection[]
}

/**
 * Loads an event's sections in order for the editor, or `null`.
 * Unknown section types (removed from the code) are left out.
 *
 * @param eventId - Event id.
 */
export async function getAdminSections(
  eventId: string
): Promise<AdminSectionsPage | null> {
  await requireAdmin()
  const [event] = await db
    .select({
      id: events.id,
      places: events.places,
      slug: events.slug,
      status: events.status,
      title: events.title,
    })
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1)
  if (!event) return null

  const rows = await db
    .select()
    .from(sections)
    .where(eq(sections.eventId, eventId))
    .orderBy(asc(sections.position))

  return {
    event: { ...event, places: parsePlaces(event.places) },
    sections: rows.flatMap((row): AdminSection[] => {
      const { type } = row
      if (!isSectionType(type)) return []
      return [
        {
          complete: sectionCatalog[type].schema.safeParse(row.data).success,
          data: row.data,
          enabled: row.enabled,
          id: row.id,
          type,
          variant: row.variant,
        },
      ]
    }),
  }
}
