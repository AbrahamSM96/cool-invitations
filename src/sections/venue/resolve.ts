import type { EventView } from '../types'

import type { VenueData } from './schema'

export interface ResolvedVenue {
  title: string
  eyebrow?: string
  placeType?: string
  name: string
  address: string
  time?: string
  note?: string
  mapsUrl?: string
  imageUrl?: string
}

/**
 * Merges a venue section with its linked place: fields typed in the
 * section win, empty ones come from the place. The first place has no time
 * of its own: it starts when the event does. `null` when the card would be
 * missing its name or address (e.g. the place was deleted).
 *
 * @param data - Venue section content.
 * @param event - Event with its places, start and time zone.
 */
export function resolveVenue(
  data: VenueData,
  event: Pick<EventView, 'places' | 'startsAt' | 'timezone'>
): ResolvedVenue | null {
  const index = data.placeId
    ? event.places.findIndex((item) => item.id === data.placeId)
    : -1
  const place = index === -1 ? undefined : event.places[index]
  // "4:30 PM", the same style admins type for the other places.
  const startTime =
    index === 0
      ? new Intl.DateTimeFormat('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          timeZone: event.timezone,
        }).format(event.startsAt)
      : undefined
  const name = data.name || place?.name
  const address = data.address || place?.address
  const title = data.title || place?.label
  if (!name || !address || !title) return null

  return {
    address,
    eyebrow: data.eyebrow,
    imageUrl: data.imageUrl,
    mapsUrl: data.mapsUrl || place?.mapsUrl || undefined,
    name,
    note: data.note,
    placeType: data.placeType || place?.placeType || undefined,
    // The first place always follows the event's start (its own time is
    // not editable in the CMS); the section can still override it.
    time: data.time || startTime || place?.time || undefined,
    title,
  }
}
