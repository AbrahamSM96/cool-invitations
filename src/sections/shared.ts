import { z } from 'zod'

/** Background band of a section. */
export const Tone = z.enum(['base', 'soft', 'strong'])
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
  return z.url().register(imageFields, meta)
}
