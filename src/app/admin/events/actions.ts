'use server'

import { randomUUID } from 'node:crypto'

import { eventCacheTag } from '@/data/invitations'
import { db } from '@/db'
import { events, sections } from '@/db/schema'
import { eventTypes } from '@/event-types'
import { requireAdmin } from '@/lib/auth/dal'
import { zonedLocalToDate } from '@/lib/dates'
import { createClientToken } from '@/lib/tokens'
import { eq } from 'drizzle-orm'
import { updateTag } from 'next/cache'
import type { z } from 'zod'

import {
  type EventActionError,
  type EventActionResult,
  EventForm,
  type EventFormData,
} from './schema'

type EventColumns = Pick<
  typeof events.$inferInsert,
  | 'cityLabel'
  | 'clientName'
  | 'hosts'
  | 'rsvpDeadline'
  | 'slug'
  | 'startsAt'
  | 'status'
  | 'templateKey'
  | 'timezone'
  | 'title'
  | 'type'
  | 'voice'
>

/**
 * Maps form data to `events` columns, turning wall-clock dates into moments.
 *
 * @param data - Validated form data.
 */
function toColumns(data: EventFormData): EventColumns {
  return {
    cityLabel: data.cityLabel,
    clientName: data.clientName,
    hosts: data.hosts,
    rsvpDeadline: data.rsvpDeadline
      ? zonedLocalToDate(data.rsvpDeadline, data.timezone)
      : null,
    slug: data.slug,
    startsAt: zonedLocalToDate(data.startsAt, data.timezone),
    status: data.status,
    templateKey: data.templateKey,
    timezone: data.timezone,
    title: data.title,
    type: data.type,
    voice: data.voice,
  }
}

/**
 * Flattens Zod issues to `{ "hosts.partner1.fullName": message }`.
 *
 * @param error - Failed parse.
 */
function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const path = issue.path.join('.')
    out[path] ??= issue.message
  }
  return out
}

/**
 * Tells whether a database error is the unique slug constraint.
 *
 * @param error - Thrown value.
 */
function isSlugTaken(error: unknown): boolean {
  const cause = error instanceof Error && 'cause' in error ? error.cause : error
  return (
    typeof cause === 'object' &&
    cause !== null &&
    'code' in cause &&
    cause.code === '23505'
  )
}

const INVALID: EventActionError = {
  error: 'Revisa los campos marcados.',
  ok: false,
}
const SLUG_TAKEN: EventActionError = {
  error: 'Ese link ya lo usa otro evento.',
  fieldErrors: { slug: 'Ya está en uso.' },
  ok: false,
}

/**
 * Creates a draft-ready event with the default sections of its type.
 *
 * @param input - Form values.
 */
export async function createEvent(input: unknown): Promise<EventActionResult> {
  await requireAdmin()
  const parsed = EventForm.safeParse(input)
  if (!parsed.success) {
    return { ...INVALID, fieldErrors: fieldErrors(parsed.error) }
  }

  // Id made here so the event and its sections go in one atomic batch.
  const id = randomUUID()
  try {
    await db.batch([
      db.insert(events).values({
        ...toColumns(parsed.data),
        clientToken: createClientToken(),
        id,
      }),
      db.insert(sections).values(
        eventTypes[parsed.data.type].defaultSections.map(
          (section, position) => ({
            eventId: id,
            position,
            type: section.type,
            variant: 'variant' in section ? section.variant : null,
          })
        )
      ),
    ])
    return { id, ok: true }
  } catch (error) {
    if (isSlugTaken(error)) return SLUG_TAKEN
    throw error
  }
}

/**
 * Saves an event's base data and refreshes its public pages.
 *
 * @param id - Event id.
 * @param input - Form values.
 */
export async function updateEvent(
  id: string,
  input: unknown
): Promise<EventActionResult> {
  await requireAdmin()
  const parsed = EventForm.safeParse(input)
  if (!parsed.success) {
    return { ...INVALID, fieldErrors: fieldErrors(parsed.error) }
  }

  const [previous] = await db
    .select({ slug: events.slug })
    .from(events)
    .where(eq(events.id, id))
    .limit(1)
  if (!previous) return { error: 'Este evento ya no existe.', ok: false }

  try {
    await db.update(events).set(toColumns(parsed.data)).where(eq(events.id, id))
  } catch (error) {
    if (isSlugTaken(error)) return SLUG_TAKEN
    throw error
  }

  // Old and new slug: a renamed event must drop its old cached page too.
  updateTag(eventCacheTag(previous.slug))
  updateTag(eventCacheTag(parsed.data.slug))
  return { id, ok: true }
}
