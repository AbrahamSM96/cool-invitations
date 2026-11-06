import { z } from 'zod'

import { Tone } from '../shared'

export const LodgingSchema = z
  .object({
    eyebrow: z.string().optional().meta({ title: 'Texto pequeño superior' }),
    hotels: z
      .array(
        z
          .object({
            address: z.string().optional().meta({ title: 'Dirección' }),
            discountCode: z.string().optional().meta({
              description:
                'Ej. "BODAVYD" o "Mencionar boda Viridiana y Daniel".',
              title: 'Código o tarifa especial',
            }),
            mapsUrl: z.url().optional().meta({ title: 'Link de Google Maps' }),
            name: z.string().min(1).meta({ title: 'Hotel' }),
            phone: z.string().optional().meta({ title: 'Teléfono' }),
            url: z.url().optional().meta({ title: 'Link para reservar' }),
          })
          .meta({
            fieldOrder: [
              'name',
              'address',
              'phone',
              'discountCode',
              'url',
              'mapsUrl',
            ],
          })
      )
      .min(1)
      .meta({ title: 'Hoteles' }),
    text: z.string().optional().meta({ title: 'Texto', widget: 'textarea' }),
    title: z.string().default('Hospedaje').meta({ title: 'Título' }),
    tone: Tone.default('base'),
  })
  .meta({ fieldOrder: ['eyebrow', 'title', 'text', 'hotels', 'tone'] })

export type LodgingData = z.infer<typeof LodgingSchema>
