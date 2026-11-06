import { z } from 'zod'

import { imageFields, type ImageMeta } from './shared'

interface BaseNode {
  label: string
  description?: string
  /** `false` for `.optional()` and `.default()` fields. */
  required: boolean
  /** Only shown for these section variants; all when absent. */
  variants?: readonly string[]
}

/** How the CMS renders one schema field. Built by `describeSchema`. */
export type FieldNode =
  | (BaseNode & { kind: 'text' | 'textarea' | 'url' | 'color' | 'number' })
  /** Picks one of the event's places (`events.places`) by id. */
  | (BaseNode & { kind: 'place' })
  | (BaseNode & { kind: 'boolean' })
  | (BaseNode & { kind: 'image'; image: ImageMeta })
  | (BaseNode & { kind: 'enum'; options: Record<string, string> })
  | (BaseNode & { kind: 'object'; fields: [string, FieldNode][] })
  | (BaseNode & { kind: 'array'; item: FieldNode })
  | (BaseNode & { kind: 'unsupported' })

/**
 * Position of `key` in a `fieldOrder` list; unlisted keys go last.
 *
 * @param order - Keys in display order.
 * @param key - Field key.
 */
function rankIn(order: readonly string[], key: string): number {
  const index = order.indexOf(key)
  return index === -1 ? order.length : index
}

/**
 * Describes a Zod schema for the generated CMS forms. Labels come from
 * `.meta({ title })`; widgets from `.meta({ widget })` and `imageField`.
 *
 * @param schema - Field (or whole section) schema.
 * @param fallbackLabel - Label when the field has no `title`.
 */
export function describeSchema(
  schema: z.ZodType,
  fallbackLabel = ''
): FieldNode {
  let current = schema
  let required = true
  let meta = current.meta()

  // Peel `.optional()` / `.default()`; metadata may sit on any layer.
  while (current instanceof z.ZodOptional || current instanceof z.ZodDefault) {
    required = false
    current = current.unwrap() as z.ZodType
    meta = { ...current.meta(), ...meta }
  }

  const base: BaseNode = {
    description: meta?.description,
    label: meta?.title ?? fallbackLabel,
    required,
    variants: meta?.variants,
  }

  if (current instanceof z.ZodObject) {
    const shape = current.shape as Record<string, z.ZodType>
    const order = meta?.fieldOrder ?? []
    return {
      ...base,
      fields: Object.keys(shape)
        .toSorted((a, b) => rankIn(order, a) - rankIn(order, b))
        .map((key): [string, FieldNode] => [
          key,
          describeSchema(shape[key], key),
        ]),
      kind: 'object',
    }
  }
  if (current instanceof z.ZodArray) {
    return {
      ...base,
      item: describeSchema(current.element as z.ZodType),
      kind: 'array',
    }
  }
  if (current instanceof z.ZodEnum) {
    const labels = meta?.optionLabels ?? {}
    const values = current.options as string[]
    return {
      ...base,
      kind: 'enum',
      options: Object.fromEntries(values.map((v) => [v, labels[v] ?? v])),
    }
  }
  if (current instanceof z.ZodBoolean) return { ...base, kind: 'boolean' }
  if (current instanceof z.ZodNumber) return { ...base, kind: 'number' }
  if (current instanceof z.ZodURL) {
    const image = imageFields.get(current)
    return image
      ? {
          ...base,
          image,
          kind: 'image',
          variants: base.variants ?? image.variants,
        }
      : { ...base, kind: 'url' }
  }
  if (current instanceof z.ZodString) {
    return { ...base, kind: meta?.widget ?? 'text' }
  }
  return { ...base, kind: 'unsupported' }
}

/**
 * Drops empty answers so optional fields validate: `''` keys go away, and a
 * nested object left empty goes away too. Array items are kept as typed.
 *
 * @param value - Raw form values.
 */
export function stripEmpty(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripEmpty)
  if (typeof value !== 'object' || value === null) return value

  const entries = Object.entries(value).flatMap(([key, item]) => {
    if (item === '' || item === undefined) return []
    const cleaned = stripEmpty(item)
    const isEmptyObject =
      typeof cleaned === 'object' &&
      cleaned !== null &&
      !Array.isArray(cleaned) &&
      Object.keys(cleaned).length === 0
    return isEmptyObject ? [] : [[key, cleaned] as const]
  })
  return Object.fromEntries(entries)
}

/**
 * Fills what a form input cannot represent as "missing": unchecked
 * checkboxes become `false` and absent lists `[]`.
 *
 * @param node - Description of the section schema.
 * @param value - Saved section data.
 */
export function withFormDefaults(node: FieldNode, value: unknown): unknown {
  if (node.kind === 'boolean') return value ?? false
  if (node.kind === 'array') return Array.isArray(value) ? value : []
  if (node.kind !== 'object') return value

  const data = (
    typeof value === 'object' && value !== null ? value : {}
  ) as Record<string, unknown>
  // Optional nested objects stay absent until the admin types into them.
  if (!node.required && value === undefined) return {}
  return Object.fromEntries(
    node.fields.map(([key, field]) => [key, withFormDefaults(field, data[key])])
  )
}
