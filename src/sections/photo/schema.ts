import { z } from 'zod'

import { imageField, Tone } from '../shared'

export const PhotoSchema = z.object({
  alt: z.string().default(''),
  imageUrl: imageField({ aspect: '3:4', label: 'Foto principal' }),
  tone: Tone.default('base'),
})

export type PhotoData = z.infer<typeof PhotoSchema>
