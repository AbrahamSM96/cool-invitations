import { z } from 'zod'

import { sections, type SectionType } from './registry'
import { imageFields, type ImageMeta } from './shared'

/** One photo the client has to provide for an invitation. */
export interface ImageSlot extends Omit<ImageMeta, 'variants'> {
  sectionId: string
  sectionType: SectionType
  /** Key inside `sections.data`. */
  field: string
  required: boolean
  /** Current URL, `null` while the client has not uploaded it. */
  value: string | null
}

interface SectionRow {
  id: string
  type: SectionType
  variant: string | null
  data: unknown
}

/**
 * Lists the client photos an invitation needs, in section order. The count
 * comes from the sections and variants the design uses.
 *
 * @param rows - Enabled sections of the event, ordered by position.
 */
export function getImageSlots(rows: readonly SectionRow[]): ImageSlot[] {
  return rows.flatMap((row) => {
    const { schema, variants } = sections[row.type]
    if (!(schema instanceof z.ZodObject)) return []

    const variant = row.variant ?? variants?.[0] ?? null
    const data = (row.data ?? {}) as Record<string, unknown>

    return Object.entries(schema.shape).flatMap(([field, fieldSchema]) => {
      const optional = fieldSchema instanceof z.ZodOptional
      const meta = imageFields.get(
        optional ? fieldSchema.unwrap() : fieldSchema
      )
      if (!meta) return []

      const { variants: onlyFor, ...rest } = meta
      if (onlyFor && (!variant || !onlyFor.includes(variant))) return []

      const value = data[field]
      return [
        {
          ...rest,
          field,
          required: !optional || onlyFor !== undefined,
          sectionId: row.id,
          sectionType: row.type,
          value: typeof value === 'string' && value ? value : null,
        },
      ]
    })
  })
}
