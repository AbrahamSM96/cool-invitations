import { z } from 'zod'

import { Tone } from '../shared'

export const ClosingSchema = z
  .object({
    message: z.string().min(1).meta({ title: 'Mensaje', widget: 'textarea' }),
    /** e.g. "con amor, Viridiana & Daniel". */
    signature: z.string().min(1).meta({
      description: 'Ej. "con amor, Viridiana & Daniel".',
      title: 'Firma',
    }),
    tone: Tone.default('soft'),
  })
  .meta({ fieldOrder: ['message', 'signature', 'tone'] })

export type ClosingData = z.infer<typeof ClosingSchema>
