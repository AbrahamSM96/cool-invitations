import { z } from 'zod'

import { Tone } from '../shared'

export const DateSchema = z.object({
  tone: Tone.default('strong'),
})

export type DateData = z.infer<typeof DateSchema>
