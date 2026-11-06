import type { Place } from '@/lib/places'

/**
 * Reads the most telling text of a section, e.g. a venue's title, to tell
 * apart two sections of the same type. Linked venues use their place.
 *
 * @param data - Section data.
 * @param places - Places of the event.
 */
export function sectionSubtitle(
  data: unknown,
  places: readonly Place[] = []
): string | null {
  if (typeof data !== 'object' || data === null) return null
  const record = data as Record<string, unknown>
  const text = record.title ?? record.name ?? record.code
  if (typeof text === 'string' && text) return text
  const place = places.find((item) => item.id === record.placeId)
  return place ? `${place.label} · ${place.name}` : null
}
