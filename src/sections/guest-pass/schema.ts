import { z } from 'zod'

import { Tone } from '../shared'

export const GuestPassSchema = z.object({
  title: z
    .string()
    .min(1)
    .meta({ description: 'Ej. "Tu pase".', title: 'Título' }),
  tone: Tone.default('soft'),
})

export type GuestPassData = z.infer<typeof GuestPassSchema>
