import { sectionCatalog, type SectionType } from './catalog'
import { describeSchema, type FieldNode } from './form-fields'
import type { ImageMeta } from './shared'

/** One photo (or set of photos) the client has to provide. */
export interface ImageSlot extends Omit<ImageMeta, 'variants'> {
  sectionId: string
  sectionType: SectionType
  /** Key inside `sections.data`. */
  field: string
  required: boolean
  /** Current URL (first photo of a set), `null` while missing. */
  value: string | null
  /** Photos uploaded so far, only for sets (gallery). */
  count?: number
}

interface SectionRow {
  id: string
  type: SectionType
  variant: string | null
  data: unknown
}

/**
 * Image field inside a list item, e.g. `url` in a gallery photo.
 *
 * @param item - Description of the list item.
 */
function imageInItem(
  item: FieldNode
): { key: string; node: Extract<FieldNode, { kind: 'image' }> } | null {
  if (item.kind !== 'object') return null
  for (const [key, node] of item.fields) {
    if (node.kind === 'image') return { key, node }
  }
  return null
}

/**
 * Lists the client photos an invitation needs, in section order. The count
 * comes from the sections and variants the design uses; a gallery counts
 * as one slot holding several photos.
 *
 * @param rows - Enabled sections of the event, ordered by position.
 */
export function getImageSlots(rows: readonly SectionRow[]): ImageSlot[] {
  return rows.flatMap((row) => {
    const entry = sectionCatalog[row.type]
    const variants: readonly string[] | undefined =
      'variants' in entry ? entry.variants : undefined
    const node = describeSchema(entry.schema)
    if (node.kind !== 'object') return []

    const variant = row.variant ?? variants?.[0] ?? null
    const data = (row.data ?? {}) as Record<string, unknown>
    const base = { sectionId: row.id, sectionType: row.type }

    return node.fields.flatMap(([field, child]): ImageSlot[] => {
      if (child.kind === 'image') {
        const { variants: onlyFor, ...meta } = child.image
        if (onlyFor && (!variant || !onlyFor.includes(variant))) return []
        const value = data[field]
        return [
          {
            ...base,
            ...meta,
            field,
            required: child.required || onlyFor !== undefined,
            value: typeof value === 'string' && value ? value : null,
          },
        ]
      }

      const image = child.kind === 'array' ? imageInItem(child.item) : null
      if (!image) return []
      const items = Array.isArray(data[field]) ? (data[field] as unknown[]) : []
      const urls = items.flatMap((item) => {
        const url = (item as Record<string, unknown> | null)?.[image.key]
        return typeof url === 'string' && url ? [url] : []
      })
      return [
        {
          ...base,
          aspect: image.node.image.aspect,
          count: urls.length,
          field,
          label: child.label,
          required: child.required,
          value: urls[0] ?? null,
        },
      ]
    })
  })
}
