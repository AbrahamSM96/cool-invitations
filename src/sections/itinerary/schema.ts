import { z } from 'zod'

import { Tone } from '../shared'

export const ItinerarySchema = z
  .object({
    eyebrow: z.string().optional().meta({ title: 'Texto pequeño superior' }),
    items: z
      .array(
        z
          .object({
            activity: z.string().min(1).meta({
              description: 'Ej. "Ceremonia religiosa".',
              title: 'Actividad',
            }),
            detail: z.string().optional().meta({ title: 'Detalle' }),
            time: z
              .string()
              .min(1)
              .meta({ description: 'Ej. "5:00 PM".', title: 'Hora' }),
          })
          .meta({ fieldOrder: ['time', 'activity', 'detail'] })
      )
      .min(1)
      .meta({ title: 'Momentos' }),
    title: z.string().default('Itinerario').meta({ title: 'Título' }),
    tone: Tone.default('soft'),
  })
  .meta({ fieldOrder: ['eyebrow', 'title', 'items', 'tone'] })

export type ItineraryData = z.infer<typeof ItinerarySchema>
