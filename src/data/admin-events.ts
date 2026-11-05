import type { EventFormInput } from '@/app/admin/events/schema'
import { db } from '@/db'
import { events, guests, rsvps } from '@/db/schema'
import { requireAdmin } from '@/lib/auth/dal'
import { dateToZonedLocal } from '@/lib/dates'
import { desc, eq, sql } from 'drizzle-orm'

export interface AdminEventRow {
  id: string
  title: string
  clientName: string | null
  slug: string
  type: (typeof events.$inferSelect)['type']
  status: (typeof events.$inferSelect)['status']
  templateKey: string
  startsAt: Date
  timezone: string
  guests: number
  /** Guests who answered "yes". */
  confirmed: number
}

/** Every event for the admin list, newest event date first. */
export async function listAdminEvents(): Promise<AdminEventRow[]> {
  await requireAdmin()
  return db
    .select({
      clientName: events.clientName,
      confirmed:
        sql<number>`count(${rsvps.id}) filter (where ${rsvps.response} = 'yes')`.mapWith(
          Number
        ),
      guests: sql<number>`count(${guests.id})`.mapWith(Number),
      id: events.id,
      slug: events.slug,
      startsAt: events.startsAt,
      status: events.status,
      templateKey: events.templateKey,
      timezone: events.timezone,
      title: events.title,
      type: events.type,
    })
    .from(events)
    .leftJoin(guests, eq(guests.eventId, events.id))
    .leftJoin(rsvps, eq(rsvps.guestId, guests.id))
    .groupBy(events.id)
    .orderBy(desc(events.startsAt))
}

/**
 * Loads an event as form values for the edit page, or `null`.
 *
 * @param id - Event id.
 */
export async function getAdminEventForm(
  id: string
): Promise<EventFormInput | null> {
  await requireAdmin()
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, id))
    .limit(1)
  if (!event) return null

  return {
    cityLabel: event.cityLabel ?? '',
    clientName: event.clientName ?? '',
    hosts: event.hosts,
    rsvpDeadline: event.rsvpDeadline
      ? dateToZonedLocal(event.rsvpDeadline, event.timezone)
      : '',
    slug: event.slug,
    startsAt: dateToZonedLocal(event.startsAt, event.timezone),
    status: event.status,
    templateKey: event.templateKey,
    timezone: event.timezone,
    title: event.title,
    type: event.type,
    voice: event.voice,
  } as EventFormInput
}

/**
 * Title, slug and status of an event for the editor header, or `null`.
 *
 * @param id - Event id.
 */
export async function getAdminEventSummary(id: string): Promise<{
  title: string
  slug: string
  status: AdminEventRow['status']
} | null> {
  await requireAdmin()
  const [event] = await db
    .select({ slug: events.slug, status: events.status, title: events.title })
    .from(events)
    .where(eq(events.id, id))
    .limit(1)
  return event ?? null
}

/**
 * Tells whether a route param can be an event id. Postgres throws on
 * malformed UUIDs instead of finding nothing.
 *
 * @param id - Route param.
 */
export function isEventId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id
  )
}
