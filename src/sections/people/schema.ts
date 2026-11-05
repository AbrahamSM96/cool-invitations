import { z } from 'zod'

import { Tone } from '../shared'

export const PeopleSchema = z
  .object({
    eyebrow: z.string().optional().meta({ title: 'Texto pequeño superior' }),
    /** e.g. "Padres de la novia" / ["Martha Zacarías Rangel"]. */
    groups: z
      .array(
        z
          .object({
            names: z
              .array(z.string().min(1).meta({ title: 'Nombre' }))
              .meta({ title: 'Nombres' }),
            title: z
              .string()
              .meta({ description: 'Ej. "Padres de la novia".', title: 'Rol' }),
          })
          .meta({ fieldOrder: ['title', 'names'] })
      )
      .min(1)
      .meta({ title: 'Grupos' }),
    title: z.string().optional().meta({ title: 'Título' }),
    tone: Tone.default('base'),
  })
  .meta({ fieldOrder: ['eyebrow', 'title', 'groups', 'tone'] })

export type PeopleData = z.infer<typeof PeopleSchema>
