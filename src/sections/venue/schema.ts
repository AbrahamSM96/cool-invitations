import { z } from 'zod'

import { imageField, Tone } from '../shared'

/**
 * A venue card. Usually linked to one of the event's places (`placeId`);
 * any field typed here overrides the place, and without a place the
 * name, address, time and title are required.
 */
export const VenueSchema = z
  .object({
    address: z
      .string()
      .optional()
      .meta({ title: 'Dirección', widget: 'textarea' }),
    /** Small caps label, e.g. "La unión". */
    eyebrow: z.string().optional().meta({ title: 'Texto pequeño superior' }),
    /** Round photo of the place. */
    imageUrl: imageField({ aspect: '1:1', label: 'Foto del lugar' }).optional(),
    mapsUrl: z.url().optional().meta({ title: 'Link de Google Maps' }),
    name: z.string().optional().meta({
      description: 'Ej. "Parroquia San José".',
      title: 'Nombre del lugar',
    }),
    /** Short note, e.g. "Sé puntual". */
    note: z
      .string()
      .optional()
      .meta({ description: 'Ej. "Sé puntual".', title: 'Nota' }),
    /** Id of a place in `events.places`. */
    placeId: z.string().optional().meta({
      description:
        'Se llena con los datos del evento. Lo que escribas abajo reemplaza ese dato.',
      title: 'Lugar del evento',
      widget: 'place',
    }),
    /** Kind of place, e.g. "Parroquia", "Hotel", "Jardín". */
    placeType: z.string().optional().meta({
      description: 'Ej. Parroquia, Hotel, Jardín.',
      title: 'Tipo de lugar',
    }),
    /** Time as shown to guests, e.g. "4:30 PM". */
    time: z
      .string()
      .optional()
      .meta({ description: 'Ej. "4:30 PM".', title: 'Hora' }),
    /** e.g. "Ceremonia religiosa", "Recepción". */
    title: z.string().optional().meta({
      description:
        'Ej. "Ceremonia religiosa". Si no, se usa el momento del lugar.',
      title: 'Título',
    }),
    tone: Tone.default('base'),
  })
  .refine(
    (venue) =>
      Boolean(venue.placeId) ||
      Boolean(venue.name && venue.address && venue.time && venue.title),
    {
      message:
        'Elige un lugar del evento o llena título, nombre, dirección y hora.',
      path: ['placeId'],
    }
  )
  .meta({
    fieldOrder: [
      'placeId',
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
