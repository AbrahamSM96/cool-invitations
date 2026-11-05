import { z } from 'zod'

import { Tone } from '../shared'

export const PhotoSchema = z.object({
  alt: z.string().default(''),
  imageUrl: z.url(),
  tone: Tone.default('base'),
})

export type PhotoData = z.infer<typeof PhotoSchema>
