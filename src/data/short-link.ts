import { db } from '@/db'
import { events, guests } from '@/db/schema'
import { guestPath } from '@/lib/guest-link'
import { GUEST_TOKEN_LENGTH } from '@/lib/tokens'
import { eq } from 'drizzle-orm'

/**
 * Full invitation path of a guest token, for the short link `/i/{token}`.
 *
 * @param token - Guest token.
 */
export async function resolveGuestToken(token: string): Promise<string | null> {
  if (token.length !== GUEST_TOKEN_LENGTH || !/^[0-9A-Za-z]+$/.test(token)) {
    return null
  }
  const [row] = await db
    .select({ eventSlug: events.slug, slug: guests.slug, token: guests.token })
    .from(guests)
    .innerJoin(events, eq(events.id, guests.eventId))
    .where(eq(guests.token, token))
    .limit(1)
  return row ? guestPath(row.eventSlug, row) : null
}
