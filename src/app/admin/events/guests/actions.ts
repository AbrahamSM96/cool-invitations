'use server'

import { db } from '@/db'
import { events, guests } from '@/db/schema'
import { requireAdmin } from '@/lib/auth/dal'
import { freeSlug, guestSlugBase, uniqueGuestSlug } from '@/lib/guest-slug'
import { createClientToken, createGuestToken } from '@/lib/tokens'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { type GuestActionResult, GuestForm, type ImportResult } from './schema'

const Id = z.uuid()

/**
 * Turns a failed parse into the action's error result.
 *
 * @param error - Zod error.
 */
function invalid(error: z.ZodError): GuestActionResult {
  const fieldErrors: Record<string, string> = {}
  for (const issue of error.issues) {
    fieldErrors[issue.path.join('.')] ??= issue.message
  }
  return { error: 'Revisa los campos marcados.', fieldErrors, ok: false }
}

const NOT_FOUND: GuestActionResult = {
  error: 'Este invitado ya no existe.',
  ok: false,
}

/**
 * Adds a guest with a fresh private token and a unique slug.
 *
 * @param eventId - Event id.
 * @param input - Form values.
 */
export async function createGuest(
  eventId: string,
  input: unknown
): Promise<GuestActionResult> {
  await requireAdmin()
  const event = Id.safeParse(eventId)
  if (!event.success) return { error: 'Este evento no existe.', ok: false }
  const parsed = GuestForm.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)

  const [exists] = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.id, event.data))
    .limit(1)
  if (!exists) return { error: 'Este evento no existe.', ok: false }

  const [row] = await db
    .insert(guests)
    .values({
      ...parsed.data,
      eventId: event.data,
      slug: await uniqueGuestSlug(event.data, parsed.data.displayName),
      token: createGuestToken(),
    })
    .returning({ id: guests.id })
  if (!row) throw new Error('Guest insert returned no row')
  return { id: row.id, ok: true }
}

/**
 * Saves a guest. Renaming changes the slug, but the token (what the link
 * really depends on) stays, and old links redirect to the new slug.
 *
 * @param guestId - Guest id.
 * @param input - Form values.
 */
export async function updateGuest(
  guestId: string,
  input: unknown
): Promise<GuestActionResult> {
  await requireAdmin()
  const id = Id.safeParse(guestId)
  if (!id.success) return NOT_FOUND
  const parsed = GuestForm.safeParse(input)
  if (!parsed.success) return invalid(parsed.error)

  const [current] = await db
    .select({ displayName: guests.displayName, eventId: guests.eventId })
    .from(guests)
    .where(eq(guests.id, id.data))
    .limit(1)
  if (!current) return NOT_FOUND

  const renamed = current.displayName !== parsed.data.displayName
  await db
    .update(guests)
    .set({
      ...parsed.data,
      ...(renamed && {
        slug: await uniqueGuestSlug(
          current.eventId,
          parsed.data.displayName,
          id.data
        ),
      }),
    })
    .where(eq(guests.id, id.data))
  return { id: id.data, ok: true }
}

/**
 * Deletes a guest with their RSVP and its history. Their link stops working.
 *
 * @param guestId - Guest id.
 */
export async function deleteGuest(guestId: string): Promise<GuestActionResult> {
  await requireAdmin()
  const id = Id.safeParse(guestId)
  if (!id.success) return NOT_FOUND
  const deleted = await db
    .delete(guests)
    .where(eq(guests.id, id.data))
    .returning({ id: guests.id })
  return deleted.length > 0 ? { id: id.data, ok: true } : NOT_FOUND
}

/** Most rows one import accepts. */
const MAX_IMPORT_ROWS = 2000

/**
 * Adds many guests at once (spreadsheet import). Every row is validated
 * again here; rows with errors are reported and nothing is half-saved:
 * either all valid rows go in, or none if the database fails.
 *
 * @param eventId - Event id.
 * @param rows - `{ line, input }` per spreadsheet row.
 * @param options - Import options.
 * @param options.skipExisting - Skip names already in the guest list.
 */
export async function importGuests(
  eventId: string,
  rows: unknown,
  options: { skipExisting: boolean }
): Promise<ImportResult> {
  await requireAdmin()
  const event = Id.safeParse(eventId)
  const list = z
    .array(z.object({ input: z.unknown(), line: z.number().int() }))
    .max(MAX_IMPORT_ROWS)
    .safeParse(rows)
  if (!event.success || !list.success) {
    return {
      error: `Máximo ${MAX_IMPORT_ROWS} invitados por archivo.`,
      ok: false,
    }
  }

  const [exists] = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.id, event.data))
    .limit(1)
  if (!exists) return { error: 'Este evento no existe.', ok: false }

  const current = await db
    .select({ name: guests.displayName, slug: guests.slug })
    .from(guests)
    .where(eq(guests.eventId, event.data))
  const takenSlugs = new Set(current.map((row) => row.slug))
  const existingNames = new Set(current.map((row) => guestSlugBase(row.name)))

  const errors: { line: number; message: string }[] = []
  const values: (typeof guests.$inferInsert)[] = []
  let skipped = 0

  for (const row of list.data) {
    const parsed = GuestForm.safeParse(row.input)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      errors.push({ line: row.line, message: issue?.message ?? 'Inválido.' })
      continue
    }
    const base = guestSlugBase(parsed.data.displayName)
    if (options.skipExisting && existingNames.has(base)) {
      skipped++
      continue
    }
    existingNames.add(base)
    values.push({
      ...parsed.data,
      eventId: event.data,
      slug: freeSlug(base, takenSlugs),
      token: createGuestToken(),
    })
  }

  if (values.length > 0) await db.insert(guests).values(values)
  return { created: values.length, errors, ok: true, skipped }
}

/**
 * Replaces the client's private link, e.g. if it leaked. The old link stops
 * working at once.
 *
 * @param eventId - Event id.
 */
export async function regenerateClientToken(
  eventId: string
): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  await requireAdmin()
  const event = Id.safeParse(eventId)
  if (!event.success) return { error: 'Este evento no existe.', ok: false }
  const token = createClientToken()
  const updated = await db
    .update(events)
    .set({ clientToken: token })
    .where(eq(events.id, event.data))
    .returning({ id: events.id })
  return updated.length > 0
    ? { ok: true, token }
    : { error: 'Este evento no existe.', ok: false }
}
