import { z } from 'zod'

import { Tone } from '../shared'

export const HashtagSchema = z
  .object({
    // No transform (the CMS form cannot render one): the view drops a
    // leading "#", so both "#BodaVyD" and "BodaVyD" work.
    hashtag: z
      .string()
      .trim()
      .regex(
        /^#?[\p{L}\p{N}_]{2,40}$/u,
        'Solo letras, números y _ (sin espacios).'
      )
      .meta({ description: 'Ej. "BodaVyD2026".', title: 'Hashtag' }),
    instagramUrl: z.url().optional().meta({
      description: 'Opcional. Si no, se abre la búsqueda del hashtag.',
      title: 'Link de Instagram',
    }),
    text: z.string().optional().meta({
      description: 'Ej. "Comparte tus fotos con nosotros".',
      title: 'Texto',
    }),
    tone: Tone.default('strong'),
  })
  .meta({ fieldOrder: ['hashtag', 'text', 'instagramUrl', 'tone'] })

export type HashtagData = z.infer<typeof HashtagSchema>
