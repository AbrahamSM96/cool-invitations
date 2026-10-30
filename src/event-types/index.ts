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
}

export const eventTypes = {
  birthday: {
    hostsSchema: BirthdayHosts,
    label: 'Cumpleaños',
    voice: 'singular',
  },
  general: { hostsSchema: GeneralHosts, label: 'General', voice: 'plural' },
  wedding: { hostsSchema: WeddingHosts, label: 'Boda', voice: 'plural' },
  xv: { hostsSchema: HonoreeHosts, label: 'XV años', voice: 'singular' },
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
