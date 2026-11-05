import { db } from '@/db'
import { events, guests, rsvps } from '@/db/schema'
import { type EventType, getHostsDisplayName } from '@/event-types'
import { CLIENT_TOKEN_LENGTH } from '@/lib/tokens'
import { asc, eq } from 'drizzle-orm'

export interface ClientGuest {
  id: string
  displayName: string
  slug: string
  token: string
  maxPasses: number
  table: string | null
  group: string | null
  phone: string | null
  status: 'enabled' | 'disabled'
  rsvp: {
    response: 'yes' | 'no'
    passes: number
    message: string | null
  } | null
}

export interface ClientPage {
  event: {
    title: string
    slug: string
    type: EventType
    hostsName: string
    published: boolean
  }
  guests: ClientGuest[]
}

/**
 * Loads the client's private page by its token. Never cached: it shows
 * live RSVP state. Internal notes are left out on purpose.
 *
 * @param token - `events.client_token` from the URL.
 */
export async function getClientPage(token: string): Promise<ClientPage | null> {
  if (token.length !== CLIENT_TOKEN_LENGTH || !/^[0-9A-Za-z]+$/.test(token)) {
    return null
  }
  const [event] = await db
    .select({
      hosts: events.hosts,
      id: events.id,
      slug: events.slug,
      status: events.status,
      title: events.title,
      type: events.type,
    })
    .from(events)
    .where(eq(events.clientToken, token))
    .limit(1)
  if (!event || event.status === 'archived') return null

  const rows = await db
    .select({
      displayName: guests.displayName,
      group: guests.group,
      id: guests.id,
      maxPasses: guests.maxPasses,
      message: rsvps.message,
      passes: rsvps.passes,
      phone: guests.phone,
      response: rsvps.response,
      slug: guests.slug,
      status: guests.status,
      table: guests.table,
      token: guests.token,
    })
    .from(guests)
    .leftJoin(rsvps, eq(rsvps.guestId, guests.id))
    .where(eq(guests.eventId, event.id))
    .orderBy(asc(guests.displayName))

  return {
    event: {
      hostsName: getHostsDisplayName(event.type, event.hosts),
      published: event.status === 'published',
      slug: event.slug,
      title: event.title,
      type: event.type,
    },
    guests: rows.map(({ message, passes, response, ...guest }) => ({
      ...guest,
      rsvp: response ? { message, passes: passes ?? 0, response } : null,
    })),
  }
}
