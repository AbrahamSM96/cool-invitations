const LOCALE = 'es-MX'

/**
 * Formats a date in the event's time zone, e.g. "sábado, 14 de noviembre de 2026".
 *
 * @param date - Date to format.
 * @param timeZone - IANA time zone of the event.
 * @param options - Extra `Intl.DateTimeFormat` options.
 */
export function formatEventDate(
  date: Date,
  timeZone: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'full' }
): string {
  return new Intl.DateTimeFormat(LOCALE, { ...options, timeZone }).format(date)
}

/**
 * Returns each date part separately, for layouts like "SÁB · 14 · NOV".
 *
 * @param date - Date to split.
 * @param timeZone - IANA time zone of the event.
 */
export function getEventDateParts(
  date: Date,
  timeZone: string
): { weekday: string; day: string; month: string; year: string; time: string } {
  return {
    day: formatEventDate(date, timeZone, { day: 'numeric' }),
    month: formatEventDate(date, timeZone, { month: 'long' }),
    time: formatEventDate(date, timeZone, {
      hour: 'numeric',
      minute: '2-digit',
    }),
    weekday: formatEventDate(date, timeZone, { weekday: 'long' }),
    year: formatEventDate(date, timeZone, { year: 'numeric' }),
  }
}
