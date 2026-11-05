import { z } from 'zod'

import { imageField, Tone } from '../shared'

export const VenueSchema = z
  .object({
    address: z.string().min(1).meta({ title: 'Dirección', widget: 'textarea' }),
    /** Small caps label, e.g. "La unión". */
    eyebrow: z.string().optional().meta({ title: 'Texto pequeño superior' }),
    /** Round photo of the place. */
    imageUrl: imageField({ aspect: '1:1', label: 'Foto del lugar' }).optional(),
    mapsUrl: z.url().optional().meta({ title: 'Link de Google Maps' }),
    name: z.string().min(1).meta({
      description: 'Ej. "Parroquia San José".',
      title: 'Nombre del lugar',
    }),
    /** Short note, e.g. "Sé puntual". */
    note: z
      .string()
      .optional()
      .meta({ description: 'Ej. "Sé puntual".', title: 'Nota' }),
    /** Kind of place, e.g. "Parroquia", "Hotel", "Jardín". */
    placeType: z.string().optional().meta({
      description: 'Ej. Parroquia, Hotel, Jardín.',
      title: 'Tipo de lugar',
    }),
    /** Time as shown to guests, e.g. "4:30 PM". */
    time: z
      .string()
      .min(1)
      .meta({ description: 'Ej. "4:30 PM".', title: 'Hora' }),
    /** e.g. "Ceremonia religiosa", "Recepción". */
    title: z.string().min(1).meta({
      description: 'Ej. "Ceremonia religiosa", "Recepción".',
      title: 'Título',
    }),
    tone: Tone.default('base'),
  })
  .meta({
    fieldOrder: [
      'title',
      'eyebrow',
      'placeType',
      'name',
      'address',
      'time',
      'note',
      'mapsUrl',
      'imageUrl',
      'tone',
    ],
  })

export type VenueData = z.infer<typeof VenueSchema>
