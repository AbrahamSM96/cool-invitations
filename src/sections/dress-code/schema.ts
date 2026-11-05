import { z } from 'zod'

import { Tone } from '../shared'

export const DressCodeSchema = z.object({
  /** e.g. "Formal", "Etiqueta", "Cóctel". */
  code: z.string().min(1),
  description: z.string().optional(),
  eyebrow: z.string().optional(),
  /** Suggested colors as hex values. */
  palette: z.array(z.string().regex(/^#[0-9a-f]{6}$/i)).default([]),
  paletteNote: z.string().optional(),
  /** e.g. "Deja el blanco para la novia". */
  reservedNote: z.string().optional(),
  tone: Tone.default('soft'),
})

export type DressCodeData = z.infer<typeof DressCodeSchema>
