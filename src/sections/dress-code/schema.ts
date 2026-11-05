import { z } from 'zod'

import { Tone } from '../shared'

export const DressCodeSchema = z
  .object({
    /** e.g. "Formal", "Etiqueta", "Cóctel". */
    code: z
      .string()
      .min(1)
      .meta({ description: 'Ej. Formal, Etiqueta, Cóctel.', title: 'Código' }),
    description: z
      .string()
      .optional()
      .meta({ title: 'Descripción', widget: 'textarea' }),
    eyebrow: z.string().optional().meta({ title: 'Texto pequeño superior' }),
    /** Suggested colors as hex values. */
    palette: z
      .array(
        z
          .string()
          .regex(/^#[0-9a-f]{6}$/i, 'Color inválido.')
          .meta({ title: 'Color', widget: 'color' })
      )
      .default([])
      .meta({ title: 'Paleta sugerida' }),
    paletteNote: z.string().optional().meta({ title: 'Nota de la paleta' }),
    /** e.g. "Deja el blanco para la novia". */
    reservedNote: z.string().optional().meta({
      description: 'Ej. "El blanco se reserva para la novia".',
      title: 'Color reservado',
    }),
    tone: Tone.default('soft'),
  })
  .meta({
    fieldOrder: [
      'eyebrow',
      'code',
      'description',
      'reservedNote',
      'palette',
      'paletteNote',
      'tone',
    ],
  })

export type DressCodeData = z.infer<typeof DressCodeSchema>
