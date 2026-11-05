import { z } from 'zod'

import { Tone } from '../shared'

export const IntroSchema = z.object({
  eyebrow: z.string().optional(),
  quote: z
    .object({ reference: z.string().optional(), text: z.string().min(1) })
    .optional(),
  text: z.string().min(1),
  tone: Tone.default('soft'),
})

export type IntroData = z.infer<typeof IntroSchema>
