import type { EventType, Voice } from '@/event-types'
import type { ReactNode } from 'react'
import type { z } from 'zod'

/** Event data every section can read. */
export interface EventView {
  id: string
  slug: string
  type: EventType
  title: string
  voice: Voice
  hostsName: string
  startsAt: Date
  timezone: string
  rsvpDeadline: Date | null
  cityLabel: string | null
}

/** Guest data, present only on a personalized invitation. */
export interface GuestView {
  token: string
  displayName: string
  maxPasses: number
  table: string | null
  personalMessage: string | null
  enabled: boolean
  rsvp: {
    response: 'yes' | 'no'
    passes: number
    message: string | null
  } | null
}

export interface SectionProps<Data> {
  data: Data
  event: EventView
  guest: GuestView | null
}

export interface SectionModule<Schema extends z.ZodType> {
  /** Name shown in the CMS. */
  label: string
  /** Validates `sections.data`. */
  schema: Schema
  /** Public rendering. */
  View: (props: SectionProps<z.infer<Schema>>) => ReactNode
}

/**
 * Declares a section module, checking that `View` accepts the schema's data.
 *
 * @param module - Section label, schema and view.
 */
export function defineSection<Schema extends z.ZodType>(
  module: SectionModule<Schema>
): SectionModule<Schema> {
  return module
}
