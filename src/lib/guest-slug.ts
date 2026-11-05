import { db } from '@/db'
import { guests } from '@/db/schema'
import { and, eq, like, ne } from 'drizzle-orm'

import { slugify } from './slug'

/**
 * Slug a guest name starts from, e.g. "Abraham y Ana" → `abraham-y-ana`.
 *
 * @param name - Guest display name.
 */
export function guestSlugBase(name: string): string {
  return slugify(name).slice(0, 50) || 'invitado'
}

/**
 * Picks a slug for a guest that no other guest of the event uses:
 * `abraham-y-ana`, then `abraham-y-ana-2`, `-3`...
 *
 * @param eventId - Event of the guest.
 * @param name - Guest display name.
 * @param exceptGuestId - Guest being renamed, whose own slug is free.
 */
export async function uniqueGuestSlug(
  eventId: string,
  name: string,
  exceptGuestId?: string
): Promise<string> {
  const base = guestSlugBase(name)
  const rows = await db
    .select({ slug: guests.slug })
    .from(guests)
    .where(
      and(
        eq(guests.eventId, eventId),
        like(guests.slug, `${base}%`),
        exceptGuestId ? ne(guests.id, exceptGuestId) : undefined
      )
    )
  return freeSlug(base, new Set(rows.map((row) => row.slug)))
}

/**
 * First of `base`, `base-2`, `base-3`... not in `taken`. Adds it to `taken`,
 * so a batch of new guests never repeats a slug.
 *
 * @param base - Wanted slug.
 * @param taken - Slugs already in use.
 */
export function freeSlug(base: string, taken: Set<string>): string {
  let slug = base
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`
  taken.add(slug)
  return slug
}
