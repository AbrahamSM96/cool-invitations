export interface CalendarEvent {
  /** Stable id, so re-adding updates instead of duplicating. */
  uid: string
  title: string
  start: Date
  end: Date
  location?: string
  description?: string
  url?: string
}

/**
 * UTC timestamp in the compact iCalendar / Google format: `20261114T223000Z`.
 *
 * @param date - Moment to format.
 */
function compactUtc(date: Date): string {
  return date
    .toISOString()
    .replaceAll(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
}

/**
 * Escapes text for an iCalendar value (RFC 5545 §3.3.11).
 *
 * @param text - Raw text.
 */
function escapeText(text: string): string {
  return text
    .replaceAll('\\', '\\\\')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,')
    .replaceAll(/\r?\n/g, '\\n')
}

/**
 * Splits a content line at 75 bytes, as iCalendar requires; continuation
 * lines start with a space. Never cuts a multi-byte character.
 *
 * @param line - Unfolded line.
 */
function fold(line: string): string {
  const encoder = new TextEncoder()
  const parts: string[] = []
  let current = ''
  for (const char of line) {
    const limit = parts.length === 0 ? 75 : 74
    if (encoder.encode(current + char).length > limit) {
      parts.push(current)
      current = char
    } else current += char
  }
  parts.push(current)
  return parts.join('\r\n ')
}

/**
 * Builds an `.ics` file with one event, for Apple Calendar, Outlook and
 * any calendar app.
 *
 * @param event - Event to add.
 */
export function buildIcs(event: CalendarEvent): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cool Invitations//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.uid}`,
    `DTSTAMP:${compactUtc(new Date())}`,
    `DTSTART:${compactUtc(event.start)}`,
    `DTEND:${compactUtc(event.end)}`,
    `SUMMARY:${escapeText(event.title)}`,
    event.location ? `LOCATION:${escapeText(event.location)}` : null,
    event.description ? `DESCRIPTION:${escapeText(event.description)}` : null,
    event.url ? `URL:${event.url}` : null,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return `${lines
    .filter((line): line is string => line !== null)
    .map(fold)
    .join('\r\n')}\r\n`
}

/**
 * Google Calendar "create event" link, prefilled.
 *
 * @param event - Event to add.
 */
export function googleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    dates: `${compactUtc(event.start)}/${compactUtc(event.end)}`,
    text: event.title,
  })
  if (event.location) params.set('location', event.location)
  const details = [event.description, event.url].filter(Boolean).join('\n\n')
  if (details) params.set('details', details)
  return `https://calendar.google.com/calendar/render?${params}`
}
