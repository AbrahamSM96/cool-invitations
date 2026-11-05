import { z } from 'zod'

import { Tone } from '../shared'

export const GuestPassSchema = z.object({
  title: z.string().min(1),
  tone: Tone.default('soft'),
})

export type GuestPassData = z.infer<typeof GuestPassSchema>
