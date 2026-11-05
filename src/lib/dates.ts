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

/**
 * Minutes the time zone is ahead of UTC at `date` (negative in Mexico).
 *
 * @param date - Moment to check (offsets change with daylight saving).
 * @param timeZone - IANA time zone.
 */
function zoneOffsetMinutes(date: Date, timeZone: string): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      hour: 'numeric',
      hourCycle: 'h23',
      minute: 'numeric',
      month: 'numeric',
      second: 'numeric',
      timeZone,
      year: 'numeric',
    })
      .formatToParts(date)
      .map((part) => [part.type, Number(part.value)])
  )
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  )
  return Math.round((asUtc - date.getTime()) / 60_000)
}

/**
 * Tells whether `timeZone` is a valid IANA name, e.g. `America/Mexico_City`.
 *
 * @param timeZone - Name to check.
 */
export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone })
    return true
  } catch {
    return false
  }
}

/**
 * Converts a wall-clock time in the event's zone (`YYYY-MM-DDTHH:mm`, the
 * value of `<input type="datetime-local">`) to the real moment.
 *
 * @param local - Wall-clock date and time.
 * @param timeZone - IANA time zone of the event.
 */
export function zonedLocalToDate(local: string, timeZone: string): Date {
  const [datePart = '', timePart = ''] = local.split('T')
  const [year = 0, month = 1, day = 1] = datePart.split('-').map(Number)
  const [hour = 0, minute = 0] = timePart.split(':').map(Number)
  const wallClock = Date.UTC(year, month - 1, day, hour, minute)

  // Two passes: the second fixes dates that cross a daylight saving change.
  let result =
    wallClock - zoneOffsetMinutes(new Date(wallClock), timeZone) * 60_000
  result = wallClock - zoneOffsetMinutes(new Date(result), timeZone) * 60_000
  return new Date(result)
}

/**
 * Inverse of `zonedLocalToDate`: the `YYYY-MM-DDTHH:mm` wall-clock value of
 * `date` in the event's zone, for filling a `datetime-local` input.
 *
 * @param date - Moment to show.
 * @param timeZone - IANA time zone of the event.
 */
export function dateToZonedLocal(date: Date, timeZone: string): string {
  const shifted = new Date(
    date.getTime() + zoneOffsetMinutes(date, timeZone) * 60_000
  )
  return shifted.toISOString().slice(0, 16)
}
