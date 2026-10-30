import { z } from 'zod'

export const VenueSchema = z.object({
  address: z.string().min(1),
  mapsUrl: z.url().optional(),
  name: z.string().min(1),
  /** Short note, e.g. "Sé puntual". */
  note: z.string().optional(),
  /** "Ceremonia", "Recepción", "Misa", "Fiesta"... */
  role: z.string().min(1),
  /** Local time as shown to guests, e.g. "16:30". */
  time: z.string().min(1),
})

export type VenueData = z.infer<typeof VenueSchema>
