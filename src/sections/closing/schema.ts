import { z } from 'zod'

import { Tone } from '../shared'

export const ClosingSchema = z.object({
  message: z.string().min(1),
  /** e.g. "con amor, Viridiana & Daniel". */
  signature: z.string().min(1),
  tone: Tone.default('soft'),
})

export type ClosingData = z.infer<typeof ClosingSchema>
