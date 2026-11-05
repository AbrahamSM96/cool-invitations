import { z } from 'zod'

import { Tone } from '../shared'

export const IntroSchema = z
  .object({
    eyebrow: z.string().optional().meta({ title: 'Texto pequeño superior' }),
    quote: z
      .object({
        reference: z.string().optional().meta({
          description: 'Ej. "1 Corintios 13:4".',
          title: 'Referencia',
        }),
        text: z.string().min(1).meta({ title: 'Cita', widget: 'textarea' }),
      })
      .meta({ fieldOrder: ['text', 'reference'] })
      .optional()
      .meta({ title: 'Cita o versículo (opcional)' }),
    text: z.string().min(1).meta({ title: 'Texto', widget: 'textarea' }),
    tone: Tone.default('soft'),
  })
  .meta({ fieldOrder: ['eyebrow', 'text', 'quote', 'tone'] })

export type IntroData = z.infer<typeof IntroSchema>
