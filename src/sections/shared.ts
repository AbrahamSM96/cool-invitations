import { z } from 'zod'

/**
 * CMS hints read by the generated section forms (`src/sections/form-fields.ts`).
 * Set with `.meta()` on a field; `title` is the label, `description` the help.
 */
declare module 'zod' {
  interface GlobalMeta {
    /** Input to use instead of the default for the field's type. */
    widget?: 'textarea' | 'color'
    /** Labels for enum values, value → label. */
    optionLabels?: Record<string, string>
    /**
     * Display order of an object's fields (keys are alphabetical in code).
     * Fields not listed go last.
     */
    fieldOrder?: readonly string[]
  }
}

/** Background band of a section. */
export const Tone = z.enum(['base', 'soft', 'strong']).meta({
  optionLabels: { base: 'Claro', soft: 'Suave', strong: 'Intenso' },
  title: 'Fondo de la franja',
})
export type Tone = z.infer<typeof Tone>

/** What the CMS asks the client for in an image slot. */
export interface ImageMeta {
  /** Name shown in the CMS checklist, e.g. "Foto de la pareja". */
  label: string
  /** Crop expected by the view. */
  aspect: '1:1' | '3:4' | '9:16'
  /** Only used (and then required) by these section variants. */
  variants?: readonly string[]
}

/** Image fields of every section schema, read by `getImageSlots`. */
export const imageFields = z.registry<ImageMeta>()

/**
 * URL field holding a client photo. Wrap with `.optional()` when the view
 * works without it.
 *
 * @param meta - How the CMS describes and crops the photo.
 */
export function imageField(meta: ImageMeta): z.ZodURL {
  // `.meta()` returns a copy, so it goes before `.register()`.
  return z
    .url()
    .meta({ description: `Formato ${meta.aspect}.`, title: meta.label })
    .register(imageFields, meta)
}
