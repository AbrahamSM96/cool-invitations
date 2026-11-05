import { z } from 'zod'

import { Tone } from '../shared'

export const GiftsSchema = z
  .object({
    /** Bank accounts or cards; each value gets a copy button. */
    accounts: z
      .array(
        z.object({
          bank: z.string().min(1).meta({ title: 'Banco' }),
          holder: z.string().optional().meta({ title: 'Titular' }),
          number: z
            .string()
            .min(1)
            .meta({ title: 'Número de cuenta, tarjeta o CLABE' }),
        })
      )
      .default([])
      .meta({
        description: 'Cada número tiene botón para copiar.',
        title: 'Cuentas bancarias',
      }),
    eyebrow: z.string().optional().meta({ title: 'Texto pequeño superior' }),
    /** Gift registries and payment links (Liverpool, Amazon, PayPal...). */
    links: z
      .array(
        z.object({
          label: z.string().min(1).meta({ title: 'Nombre' }),
          url: z.url().meta({ title: 'Link' }),
        })
      )
      .default([])
      .meta({
        description: 'Liverpool, Amazon, PayPal…',
        title: 'Mesas de regalo y links',
      }),
    text: z.string().optional().meta({ title: 'Texto', widget: 'textarea' }),
    title: z.string().optional().meta({ title: 'Título' }),
    tone: Tone.default('base'),
  })
  .meta({
    fieldOrder: ['eyebrow', 'title', 'text', 'accounts', 'links', 'tone'],
  })

export type GiftsData = z.infer<typeof GiftsSchema>
