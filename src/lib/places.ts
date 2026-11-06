import { z } from 'zod'

/**
 * A place of the event (ceremony, reception...), stored in `events.places`
 * and picked by "Lugar" sections, so each address is typed once.
 */
export const PlaceSchema = z.object({
  address: z.string().trim().min(1, 'Escribe la dirección.').max(300),
  /** Stable id, referenced by `sections.data.placeId`. */
  id: z.string().min(1).max(40),
  /** Role in the event, e.g. "Ceremonia", "Recepción". */
  label: z.string().trim().min(1, 'Ej. "Ceremonia".').max(40),
  // Empty strings are kept as "not set": views treat '' as missing.
  mapsUrl: z
    .url('Pega el link completo de Google Maps.')
    .or(z.literal(''))
    .optional(),
  name: z.string().trim().min(1, 'Escribe el nombre del lugar.').max(120),
  /** Kind of place, e.g. "Parroquia", "Hotel". */
  placeType: z.string().trim().max(40).optional(),
  /** Time as shown to guests, e.g. "4:30 PM". */
  time: z.string().trim().max(20).optional(),
})

export type Place = z.output<typeof PlaceSchema>
export type PlaceInput = z.input<typeof PlaceSchema>

/**
 * Reads `events.places` leniently: invalid entries are dropped, so a bad
 * row never breaks the invitation.
 *
 * @param value - Raw column value.
 */
export function parsePlaces(value: unknown): Place[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    const parsed = PlaceSchema.safeParse(item)
    return parsed.success ? [parsed.data] : []
  })
}

/**
 * One-line location for calendars: "Hotel Riu, Av. López Mateos 123".
 *
 * @param place - Place to describe.
 */
export function placeLocation(place: Place): string {
  return `${place.name}, ${place.address}`
}
