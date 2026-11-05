import { db } from '@/db'
import { events } from '@/db/schema'
import { requireAdmin } from '@/lib/auth/dal'
import type { GuestView } from '@/sections/types'
import { eq } from 'drizzle-orm'

import { buildInvitation, type PublishedEvent } from './invitations'

/**
 * Loads any event, drafts included, as the invitation would render. Admin
 * only and never cached, so it always shows the latest saved content.
 *
 * @param id - Event id.
 */
export async function getEventPreview(
  id: string
): Promise<PublishedEvent | null> {
  await requireAdmin()
  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, id))
    .limit(1)
  return event ? buildInvitation(event) : null
}

/** Made-up guest to preview the personalized parts (pass, RSVP). */
export const SAMPLE_GUEST: GuestView = {
  displayName: 'Invitado de ejemplo',
  enabled: true,
  maxPasses: 2,
  personalMessage: null,
  rsvp: null,
  table: '5',
  // Not a real token: the RSVP form answers "Esta invitación no existe".
  token: 'preview',
}
