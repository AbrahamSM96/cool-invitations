/**
 * Reads the most telling text of a section, e.g. a venue's title, to tell
 * apart two sections of the same type.
 *
 * @param data - Section data.
 */
export function sectionSubtitle(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) return null
  const record = data as Record<string, unknown>
  const text = record.title ?? record.name ?? record.code
  return typeof text === 'string' && text ? text : null
}
