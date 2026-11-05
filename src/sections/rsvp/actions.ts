'use server'

import { db } from '@/db'
import { events, guests, rsvpHistory, rsvps } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'
import { refresh } from 'next/cache'
import { headers } from 'next/headers'

import { type RsvpFormState, RsvpSubmission } from './schema'

/**
 * Saves a guest's RSVP and appends it to the history.
 * All rules are enforced here; the form is never trusted.
 *
 * @param token - Guest token from the invitation URL.
 * @param _previous - Previous form state (required by `useActionState`).
 * @param formData - Submitted form.
 */
export async function submitRsvp(
  token: string,
  _previous: RsvpFormState,
  formData: FormData
): Promise<RsvpFormState> {
  const parsed = RsvpSubmission.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return {
      error: 'Revisa tu respuesta e inténtalo de nuevo.',
      status: 'error',
    }
  }

  const [guest] = await db
    .select({
      eventStatus: events.status,
      id: guests.id,
      maxPasses: guests.maxPasses,
      rsvpDeadline: events.rsvpDeadline,
      status: guests.status,
    })
    .from(guests)
    .innerJoin(events, eq(events.id, guests.eventId))
    .where(eq(guests.token, token))
    .limit(1)

  if (!guest || guest.eventStatus !== 'published') {
    return { error: 'Esta invitación no existe.', status: 'error' }
  }
  if (guest.status === 'disabled') {
    return { error: 'Este pase está deshabilitado.', status: 'error' }
  }
  if (guest.rsvpDeadline && guest.rsvpDeadline.getTime() < Date.now()) {
    return { error: 'La fecha para confirmar ya pasó.', status: 'error' }
  }

  const { message, response } = parsed.data
  const passes = response === 'no' ? 0 : parsed.data.passes
  if (response === 'yes' && (passes < 1 || passes > guest.maxPasses)) {
    return {
      error: `Elige entre 1 y ${guest.maxPasses} pases.`,
      status: 'error',
    }
  }

  const requestHeaders = await headers()
  const answer = { message, passes, response }

  await db.batch([
    db
      .insert(rsvps)
      .values({ ...answer, guestId: guest.id })
      .onConflictDoUpdate({
        set: { ...answer, respondedAt: sql`now()` },
        target: rsvps.guestId,
      }),
    db.insert(rsvpHistory).values({
      ...answer,
      guestId: guest.id,
      ip: requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      userAgent: requestHeaders.get('user-agent'),
    }),
  ])

  // Re-render the page so server parts (e.g. the RSVP bar) show the answer.
  refresh()

  return { answer, status: 'saved' }
}
