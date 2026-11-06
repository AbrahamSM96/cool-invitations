import { db } from '@/db'
import { events } from '@/db/schema'
import { requireAdmin } from '@/lib/auth/dal'
import { parseOverrides, type ThemeOverrides } from '@/templates/overrides'
import { getTemplate } from '@/templates/registry'
import type { Theme } from '@/templates/types'
import { eq } from 'drizzle-orm'

export interface AdminDesign {
  templateName: string
  /** Template theme before the event's changes. */
  baseTheme: Theme
  overrides: ThemeOverrides
}

/**
 * Loads what the "Diseño" tab edits, or `null` for an unknown event.
 *
 * @param eventId - Event id.
 */
export async function getAdminDesign(
  eventId: string
): Promise<AdminDesign | null> {
  await requireAdmin()
  const [event] = await db
    .select({
      overrides: events.themeOverrides,
      templateKey: events.templateKey,
    })
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1)
  if (!event) return null
  const template = getTemplate(event.templateKey)
  return {
    baseTheme: template.theme,
    overrides: parseOverrides(event.overrides),
    templateName: template.name,
  }
}
