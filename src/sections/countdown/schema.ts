import { z } from 'zod'

import { Tone } from '../shared'

export const CountdownSchema = z.object({
  /** Shown once the event has started. */
  afterText: z.string().min(1),
  title: z.string().min(1),
  tone: Tone.default('base'),
})

export type CountdownData = z.infer<typeof CountdownSchema>
