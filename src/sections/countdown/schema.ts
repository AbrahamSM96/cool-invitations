import { z } from 'zod'

import { Tone } from '../shared'

export const CountdownSchema = z
  .object({
    /** Shown once the event has started. */
    afterText: z.string().min(1).meta({
      description: 'Se muestra cuando ya empezó el evento.',
      title: 'Texto al llegar a cero',
    }),
    title: z.string().min(1).meta({ title: 'Título' }),
    tone: Tone.default('base'),
  })
  .meta({ fieldOrder: ['title', 'afterText', 'tone'] })

export type CountdownData = z.infer<typeof CountdownSchema>
