import type { SectionType } from '@/sections/catalog'
import type { z } from 'zod'

import {
  BirthdayHosts,
  GeneralHosts,
  HonoreeHosts,
  WeddingHosts,
} from './schemas'

export type EventType = 'wedding' | 'xv' | 'birthday' | 'general'
export type Voice = 'singular' | 'plural'

interface EventTypeConfig {
  /** Name shown in the CMS. */
  label: string
  /** Default grammatical voice for copy ("Te espero" vs "Los esperamos"). */
  voice: Voice
  /** Validates `events.hosts` for this type. */
  hostsSchema: z.ZodType
  /** Sections a new event starts with, in order. Filled in the editor. */
  defaultSections: readonly { type: SectionType; variant?: string }[]
  /**
   * Suggested roles for the event's places, in order. Its length is how
   * many "Lugar" sections a new event gets.
   */
  placeLabels: readonly string[]
}

/**
 * Default sections of XV and birthdays, which differ only in how many
 * venues they usually have.
 *
 * @param venues - Number of "Lugar" sections.
 */
function honoreeSections(venues: number): EventTypeConfig['defaultSections'] {
  return [
    { type: 'envelope' },
    { type: 'hero', variant: 'photo' },
    { type: 'countdown' },
    { type: 'guest_pass' },
    { type: 'intro' },
    { type: 'gallery', variant: 'carousel' },
    { type: 'date' },
    ...Array.from({ length: venues }, () => ({ type: 'venue' as const })),
    { type: 'add_to_calendar' },
    { type: 'itinerary' },
    { type: 'people' },
    { type: 'dress_code' },
    { type: 'gifts' },
    { type: 'hashtag' },
    { type: 'contact' },
    { type: 'rsvp' },
    { type: 'closing' },
  ]
}

export const eventTypes = {
  birthday: {
    defaultSections: honoreeSections(1),
    hostsSchema: BirthdayHosts,
    label: 'Cumpleaños',
    placeLabels: ['Fiesta'],
    voice: 'singular',
  },
  general: {
    defaultSections: [
      { type: 'envelope' },
      { type: 'hero', variant: 'classic' },
      { type: 'countdown' },
      { type: 'date' },
      { type: 'venue' },
      { type: 'add_to_calendar' },
      { type: 'guest_pass' },
      { type: 'rsvp' },
      { type: 'closing' },
    ],
    hostsSchema: GeneralHosts,
    label: 'General',
    placeLabels: ['Evento'],
    voice: 'plural',
  },
  wedding: {
    defaultSections: [
      { type: 'envelope' },
      { type: 'hero', variant: 'classic' },
      { type: 'countdown' },
      { type: 'intro' },
      { type: 'photo' },
      { type: 'date' },
      { type: 'venue' },
      { type: 'venue' },
      { type: 'people' },
      { type: 'dress_code' },
      { type: 'gifts' },
      { type: 'guest_pass' },
      { type: 'rsvp' },
      { type: 'closing' },
    ],
    hostsSchema: WeddingHosts,
    label: 'Boda',
    placeLabels: ['Ceremonia', 'Recepción'],
    voice: 'plural',
  },
  xv: {
    defaultSections: honoreeSections(2),
    hostsSchema: HonoreeHosts,
    label: 'XV años',
    placeLabels: ['Misa', 'Recepción'],
    voice: 'singular',
  },
} satisfies Record<EventType, EventTypeConfig>

/**
 * Returns the names shown in the hero and closing, e.g. "Viridiana & Daniel".
 *
 * @param type - Event type.
 * @param hosts - Raw `events.hosts` value; validated against the type's schema.
 */
export function getHostsDisplayName(type: EventType, hosts: unknown): string {
  switch (type) {
    case 'wedding':
      return WeddingHosts.parse(hosts).coupleDisplay
    case 'xv':
      return HonoreeHosts.parse(hosts).honoree.shortName
    case 'birthday':
      return BirthdayHosts.parse(hosts).honoree.shortName
    case 'general':
      return GeneralHosts.parse(hosts).hostDisplay
  }
}

/**
 * Title of the event for guests' calendars and messages, e.g.
 * "Boda de Viridiana & Daniel", "XV años de Camila".
 *
 * @param type - Event type.
 * @param hostsName - Names from `getHostsDisplayName`.
 */
export function eventTitleFor(type: EventType, hostsName: string): string {
  switch (type) {
    case 'wedding':
      return `Boda de ${hostsName}`
    case 'xv':
      return `XV años de ${hostsName}`
    case 'birthday':
      return `Cumpleaños de ${hostsName}`
    case 'general':
      return hostsName
  }
}
