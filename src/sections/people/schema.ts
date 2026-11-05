import { z } from 'zod'

import { Tone } from '../shared'

export const PeopleSchema = z.object({
  eyebrow: z.string().optional(),
  /** e.g. "Padres de la novia" / ["Martha Zacarías Rangel"]. */
  groups: z
    .array(z.object({ names: z.array(z.string().min(1)), title: z.string() }))
    .min(1),
  title: z.string().optional(),
  tone: Tone.default('base'),
})

export type PeopleData = z.infer<typeof PeopleSchema>
