'use server'

import { eventCacheTag } from '@/data/invitations'
import { db } from '@/db'
import { events } from '@/db/schema'
import { requireAdmin } from '@/lib/auth/dal'
import '@/lib/zod-es'
import { stripEmpty } from '@/sections/form-fields'
import { ThemeOverridesSchema } from '@/templates/overrides'
import { eq } from 'drizzle-orm'
import { updateTag } from 'next/cache'
import { z } from 'zod'

export type DesignActionResult = { ok: true } | { ok: false; error: string }

/**
 * Saves an event's design changes and refreshes its public pages. Empty
 * values are dropped, so "back to the template" is just leaving it out.
 *
 * @param eventId - Event id.
 * @param input - Changes from the "Diseño" tab.
 */
export async function saveEventDesign(
  eventId: string,
  input: unknown
): Promise<DesignActionResult> {
  await requireAdmin()
  const id = z.uuid().safeParse(eventId)
  if (!id.success) return { error: 'Este evento no existe.', ok: false }
  const parsed = ThemeOverridesSchema.safeParse(stripEmpty(input))
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? 'Revisa el diseño.',
      ok: false,
    }
  }

  const [event] = await db
    .update(events)
    .set({ themeOverrides: parsed.data })
    .where(eq(events.id, id.data))
    .returning({ slug: events.slug })
  if (!event) return { error: 'Este evento no existe.', ok: false }

  updateTag(eventCacheTag(event.slug))
  return { ok: true }
}
