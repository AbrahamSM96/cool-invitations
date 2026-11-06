import { z } from 'zod'

import { imageField, Tone } from '../shared'

export const GALLERY_VARIANTS = ['carousel', 'grid'] as const

export const GallerySchema = z
  .object({
    eyebrow: z.string().optional().meta({ title: 'Texto pequeño superior' }),
    photos: z
      .array(
        z
          .object({
            alt: z.string().optional().meta({
              description: 'Para lectores de pantalla.',
              title: 'Descripción',
            }),
            url: imageField({ aspect: '3:4', label: 'Foto' }),
          })
          .meta({ fieldOrder: ['url', 'alt'] })
      )
      .min(1, 'Sube al menos una foto.')
      .max(24, 'Máximo 24 fotos.')
      .meta({ description: 'Hasta 24.', title: 'Galería' }),
    title: z.string().optional().meta({ title: 'Título' }),
    tone: Tone.default('base'),
  })
  .meta({ fieldOrder: ['eyebrow', 'title', 'photos', 'tone'] })

export type GalleryData = z.infer<typeof GallerySchema>
