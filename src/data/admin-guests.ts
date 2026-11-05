import { db } from '@/db'
import { events, guests, rsvps } from '@/db/schema'
import { type EventType, getHostsDisplayName } from '@/event-types'
import { requireAdmin } from '@/lib/auth/dal'
import { asc, eq } from 'drizzle-orm'

export interface AdminGuest {
  id: string
  displayName: string
  slug: string
  token: string
  maxPasses: number
  adults: number | null
  kids: number | null
  table: string | null
  group: string | null
  phone: string | null
  personalMessage: string | null
  notes: string | null
  status: 'enabled' | 'disabled'
  rsvp: {
    response: 'yes' | 'no'
    passes: number
    message: string | null
    respondedAt: Date
  } | null
}

export interface AdminGuestsPage {
  event: {
    /** Access token of the client's private page `/c/{token}`. */
    clientToken: string
    slug: string
    status: string
    title: string
    type: EventType
    hostsName: string
  }
  guests: AdminGuest[]
}

/**
 * Loads an event's guests with their current RSVP, by name, or `null`.
 *
 * @param eventId - Event id.
 */
export async function getAdminGuests(
  eventId: string
): Promise<AdminGuestsPage | null> {
  await requireAdmin()
  const [event] = await db
    .select({
      clientToken: events.clientToken,
      hosts: events.hosts,
      slug: events.slug,
      status: events.status,
      title: events.title,
      type: events.type,
    })
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1)
  if (!event) return null

  const rows = await db
    .select({ guest: guests, rsvp: rsvps })
    .from(guests)
    .leftJoin(rsvps, eq(rsvps.guestId, guests.id))
    .where(eq(guests.eventId, eventId))
    .orderBy(asc(guests.displayName))

  return {
    event: {
      clientToken: event.clientToken,
      hostsName: getHostsDisplayName(event.type, event.hosts),
      slug: event.slug,
      status: event.status,
      title: event.title,
      type: event.type,
    },
    guests: rows.map(({ guest, rsvp }) => ({
      adults: guest.adults,
      displayName: guest.displayName,
      group: guest.group,
      id: guest.id,
      kids: guest.kids,
      maxPasses: guest.maxPasses,
      notes: guest.notes,
      personalMessage: guest.personalMessage,
      phone: guest.phone,
      rsvp: rsvp
        ? {
            message: rsvp.message,
            passes: rsvp.passes,
            respondedAt: rsvp.respondedAt,
            response: rsvp.response,
          }
        : null,
      slug: guest.slug,
      status: guest.status,
      table: guest.table,
      token: guest.token,
    })),
  }
}
