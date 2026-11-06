import { eventTitleFor } from '@/event-types'
import type { CalendarEvent } from '@/lib/calendar'
import { placeLocation } from '@/lib/places'

import type { EventView } from '../types'

import type { CalendarData } from './schema'

/**
 * Calendar entry of an invitation, shared by the Google link and the
 * `.ics` file so both always match.
 *
 * @param event - Event of the invitation.
 * @param data - "Agendar fecha" section content.
 * @param url - Invitation URL, added to the description.
 */
export function calendarEventOf(
  event: EventView,
  data: CalendarData,
  url?: string
): CalendarEvent {
  return {
    description: data.text,
    end: new Date(event.startsAt.getTime() + data.durationHours * 3_600_000),
    // Without its own address, the calendar uses the event's first place.
    location:
      data.location || (event.places[0] && placeLocation(event.places[0])),
    start: event.startsAt,
    title: eventTitleFor(event.type, event.hostsName),
    uid: `${event.id}@cool-invitations`,
    url,
  }
}
