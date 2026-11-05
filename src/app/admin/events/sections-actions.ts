'use server'

import { eventCacheTag } from '@/data/invitations'
import { db } from '@/db'
import { events, sections } from '@/db/schema'
import { requireAdmin } from '@/lib/auth/dal'
import { isSectionType, sectionCatalog } from '@/sections/catalog'
import { stripEmpty } from '@/sections/form-fields'
import '@/lib/zod-es'
import { and, eq, inArray, max, sql } from 'drizzle-orm'
import { updateTag } from 'next/cache'
import { z } from 'zod'

export type SectionActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

const Id = z.uuid()

/**
 * Expires the public pages of the event that owns a section.
 *
 * @param eventId - Event id.
 */
async function refreshEvent(eventId: string): Promise<void> {
  const [event] = await db
    .select({ slug: events.slug })
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1)
  if (event) updateTag(eventCacheTag(event.slug))
}

/**
 * Finds the section a request is about, or `null` for bad or unknown ids.
 *
 * @param sectionId - Section id from the client.
 */
async function findSection(
  sectionId: unknown
): Promise<{ eventId: string; type: string } | null> {
  const id = Id.safeParse(sectionId)
  if (!id.success) return null
  const [row] = await db
    .select({ eventId: sections.eventId, type: sections.type })
    .from(sections)
    .where(eq(sections.id, id.data))
    .limit(1)
  return row ?? null
}

const NOT_FOUND: SectionActionResult = {
  error: 'Esta sección ya no existe.',
  ok: false,
}

/**
 * Saves a section's content and layout. Data must pass its schema: an
 * invalid section would be hidden from the invitation anyway.
 *
 * @param sectionId - Section id.
 * @param input - Values from the editor.
 * @param input.data - Section content.
 * @param input.variant - Chosen layout, if the section has several.
 */
export async function saveSection(
  sectionId: string,
  input: { data: unknown; variant: string | null }
): Promise<SectionActionResult> {
  await requireAdmin()
  const section = await findSection(sectionId)
  if (!section || !isSectionType(section.type)) return NOT_FOUND

  const entry = sectionCatalog[section.type]
  const parsed = entry.schema.safeParse(stripEmpty(input.data))
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join('.')] ??= issue.message
    }
    return { error: 'Revisa los campos marcados.', fieldErrors, ok: false }
  }

  const variants: readonly string[] = 'variants' in entry ? entry.variants : []
  const variant =
    input.variant && variants.includes(input.variant) ? input.variant : null

  await db
    .update(sections)
    .set({ data: parsed.data, variant })
    .where(eq(sections.id, sectionId))
  await refreshEvent(section.eventId)
  return { ok: true }
}

/**
 * Shows or hides a section in the invitation.
 *
 * @param sectionId - Section id.
 * @param enabled - New state.
 */
export async function setSectionEnabled(
  sectionId: string,
  enabled: boolean
): Promise<SectionActionResult> {
  await requireAdmin()
  const section = await findSection(sectionId)
  if (!section) return NOT_FOUND

  await db
    .update(sections)
    .set({ enabled: enabled === true })
    .where(eq(sections.id, sectionId))
  await refreshEvent(section.eventId)
  return { ok: true }
}

/**
 * Stores a new section order. The list must hold exactly the event's
 * sections, so a stale tab cannot drop or duplicate any.
 *
 * @param eventId - Event id.
 * @param orderedIds - Every section id of the event, in the new order.
 */
export async function reorderSections(
  eventId: string,
  orderedIds: string[]
): Promise<SectionActionResult> {
  await requireAdmin()
  const ids = z.array(Id).safeParse(orderedIds)
  const event = Id.safeParse(eventId)
  if (!ids.success || !event.success) return NOT_FOUND

  const current = await db
    .select({ id: sections.id })
    .from(sections)
    .where(eq(sections.eventId, event.data))
  const known = new Set(current.map((row) => row.id))
  if (
    ids.data.length !== known.size ||
    new Set(ids.data).size !== known.size ||
    ids.data.some((id) => !known.has(id))
  ) {
    return {
      error: 'Las secciones cambiaron en otra pestaña. Recarga la página.',
      ok: false,
    }
  }

  if (ids.data.length > 0) {
    // One UPDATE: position = index of the id in the list.
    await db
      .update(sections)
      .set({
        position: sql`array_position(ARRAY[${sql.join(
          ids.data.map((id) => sql`${id}`),
          sql`, `
        )}]::uuid[], ${sections.id}) - 1`,
      })
      .where(
        and(eq(sections.eventId, event.data), inArray(sections.id, ids.data))
      )
  }
  await refreshEvent(event.data)
  return { ok: true }
}

/**
 * Appends an empty section of a type to the end of the event.
 *
 * @param eventId - Event id.
 * @param type - Section type.
 */
export async function addSection(
  eventId: string,
  type: string
): Promise<SectionActionResult & { id?: string }> {
  await requireAdmin()
  const event = Id.safeParse(eventId)
  if (!event.success || !isSectionType(type)) return NOT_FOUND

  const [last] = await db
    .select({ position: max(sections.position) })
    .from(sections)
    .where(eq(sections.eventId, event.data))
  const entry = sectionCatalog[type]

  const [row] = await db
    .insert(sections)
    .values({
      eventId: event.data,
      position: (last?.position ?? -1) + 1,
      type,
      variant: 'variants' in entry ? (entry.variants[0] ?? null) : null,
    })
    .returning({ id: sections.id })
  await refreshEvent(event.data)
  return { id: row?.id, ok: true }
}

/**
 * Deletes a section and its content.
 *
 * @param sectionId - Section id.
 */
export async function deleteSection(
  sectionId: string
): Promise<SectionActionResult> {
  await requireAdmin()
  const section = await findSection(sectionId)
  if (!section) return NOT_FOUND

  await db.delete(sections).where(eq(sections.id, sectionId))
  await refreshEvent(section.eventId)
  return { ok: true }
}
