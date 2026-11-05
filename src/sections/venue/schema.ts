import { z } from 'zod'

import { Tone } from '../shared'

export const VenueSchema = z.object({
  address: z.string().min(1),
  /** Small caps label, e.g. "La unión". */
  eyebrow: z.string().optional(),
  /** Round photo of the place. */
  imageUrl: z.url().optional(),
  mapsUrl: z.url().optional(),
  name: z.string().min(1),
  /** Short note, e.g. "Sé puntual". */
  note: z.string().optional(),
  /** Kind of place, e.g. "Parroquia", "Hotel", "Jardín". */
  placeType: z.string().optional(),
  /** Time as shown to guests, e.g. "4:30 PM". */
  time: z.string().min(1),
  /** e.g. "Ceremonia religiosa", "Recepción". */
  title: z.string().min(1),
  tone: Tone.default('base'),
})

export type VenueData = z.infer<typeof VenueSchema>
