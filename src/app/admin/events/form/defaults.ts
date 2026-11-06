import type { EventType } from '@/event-types'
import { slugify } from '@/lib/slug'

import type { EventFormInput } from '../schema'

const emptyName = { fullName: '', shortName: '' }

/**
 * Blank `hosts` for an event type, used when the type changes.
 *
 * @param type - New event type.
 */
export function emptyHosts(type: EventType): EventFormInput['hosts'] {
  switch (type) {
    case 'wedding':
      return { coupleDisplay: '', partner1: emptyName, partner2: emptyName }
    case 'xv':
      return { honoree: emptyName, honoreeGender: 'female' }
    case 'birthday':
      return { honoree: emptyName, honoreeGender: 'female' }
    case 'general':
      return { eventName: '', hostDisplay: '' }
  }
}

/** Starting values of the "new event" form. */
export const NEW_EVENT: EventFormInput = {
  cityLabel: '',
  clientName: '',
  hosts: { coupleDisplay: '', partner1: emptyName, partner2: emptyName },
  places: [],
  rsvpDeadline: '',
  slug: '',
  startsAt: '',
  status: 'draft',
  templateKey: 'beige-oliva',
  timezone: 'America/Mexico_City',
  title: '',
  type: 'wedding',
  voice: 'plural',
}

/**
 * Suggests the public slug from the hosts' names, falling back to the title.
 *
 * @param values - Current form values.
 */
export function suggestSlug(values: EventFormInput): string {
  const hosts: Record<string, unknown> = values.hosts
  const honoree = hosts.honoree as { shortName?: string } | undefined
  const name =
    values.type === 'wedding'
      ? hosts.coupleDisplay
      : values.type === 'general'
        ? hosts.hostDisplay
        : honoree?.shortName && `${values.type} ${honoree.shortName}`
  return slugify(typeof name === 'string' && name ? name : values.title)
}
