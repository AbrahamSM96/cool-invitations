import { z } from 'zod'

import { imageField, Tone } from '../shared'

export const PhotoSchema = z
  .object({
    alt: z.string().default('').meta({
      description: 'Para lectores de pantalla. Ej. "Viridiana y Daniel".',
      title: 'Descripción de la foto',
    }),
    imageUrl: imageField({ aspect: '3:4', label: 'Foto principal' }),
    tone: Tone.default('base'),
  })
  .meta({ fieldOrder: ['imageUrl', 'alt', 'tone'] })

export type PhotoData = z.infer<typeof PhotoSchema>
