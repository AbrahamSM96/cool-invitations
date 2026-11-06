import { db } from '@/db'
import { events, guests, rsvps, sections } from '@/db/schema'
import { getHostsDisplayName } from '@/event-types'
import { parsePlaces } from '@/lib/places'
import { isSectionType, type SectionType } from '@/sections/registry'
import { sections as sectionModules } from '@/sections/registry'
import type { EventView, GuestView } from '@/sections/types'
import { parseOverrides, type ThemeOverrides } from '@/templates/overrides'
import { and, asc, eq } from 'drizzle-orm'
import { cacheLife, cacheTag } from 'next/cache'

export interface InvitationSection {
  id: string
  type: SectionType
  variant: string | null
  data: unknown
}

export interface PublishedEvent {
  event: EventView
  templateKey: string
  /** Event changes to its template ("Diseño" tab). */
  themeOverrides: ThemeOverrides
  sections: InvitationSection[]
}

/**
 * Cache tag for everything rendered from one event. Publishing an event must
 * call `revalidateTag(eventCacheTag(slug), 'max')`.
 *
 * @param slug - Event slug.
 */
export function eventCacheTag(slug: string): string {
  return `event:${slug}`
}

/**
 * Loads a published event with its enabled sections, in order. Cached: the
 * same for every guest, so it never contains guest data.
 * Sections whose data no longer matches their schema are skipped.
 *
 * @param slug - Event slug from the URL.
 */
export async function getPublishedEvent(
  slug: string
): Promise<PublishedEvent | null> {
  'use cache'
  cacheLife('max')
  cacheTag(eventCacheTag(slug))

  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.slug, slug), eq(events.status, 'published')))
    .limit(1)

  return event ? buildInvitation(event) : null
}

/**
 * Loads an event's sections and shapes it for `<Invitation>`. Shared by the
 * public pages and the admin preview, which picks the event differently.
 *
 * @param event - Event row.
 */
export async function buildInvitation(
  event: typeof events.$inferSelect
): Promise<PublishedEvent> {
  const rows = await db
    .select({
      data: sections.data,
      id: sections.id,
      type: sections.type,
      variant: sections.variant,
    })
    .from(sections)
    .where(and(eq(sections.eventId, event.id), eq(sections.enabled, true)))
    .orderBy(asc(sections.position))

  const validSections = rows.flatMap((row): InvitationSection[] => {
    if (!isSectionType(row.type)) return []
    const parsed = sectionModules[row.type].schema.safeParse(row.data)
    return parsed.success
      ? [
          {
            data: parsed.data,
            id: row.id,
            type: row.type,
            variant: row.variant,
          },
        ]
      : []
  })

  return {
    event: {
      cityLabel: event.cityLabel,
      hostsName: getHostsDisplayName(event.type, event.hosts),
      id: event.id,
      places: parsePlaces(event.places),
      rsvpDeadline: event.rsvpDeadline,
      slug: event.slug,
      startsAt: event.startsAt,
      timezone: event.timezone,
      title: event.title,
      type: event.type,
      voice: event.voice,
    },
    sections: validSections,
    templateKey: event.templateKey,
    themeOverrides: parseOverrides(event.themeOverrides),
  }
}

/**
 * Loads a guest's pass and current RSVP. Never cached: it is private and
 * changes when the guest answers.
 *
 * @param eventId - Event the guest must belong to.
 * @param token - Guest token from the URL.
 */
export async function getGuest(
  eventId: string,
  token: string
): Promise<(GuestView & { slug: string }) | null> {
  const [row] = await db
    .select({ guest: guests, rsvp: rsvps })
    .from(guests)
    .leftJoin(rsvps, eq(rsvps.guestId, guests.id))
    .where(and(eq(guests.token, token), eq(guests.eventId, eventId)))
    .limit(1)

  if (!row) return null

  const { guest, rsvp } = row

  return {
    displayName: guest.displayName,
    enabled: guest.status === 'enabled',
    maxPasses: guest.maxPasses,
    personalMessage: guest.personalMessage,
    rsvp: rsvp
      ? { message: rsvp.message, passes: rsvp.passes, response: rsvp.response }
      : null,
    slug: guest.slug,
    table: guest.table,
    token: guest.token,
  }
}
