import type { EventType, Voice } from '@/event-types'
import type { Place } from '@/lib/places'
import type { Theme } from '@/templates/types'
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
  /** Places from the event data, picked by "Lugar" sections. */
  places: Place[]
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
  theme: Theme
  /** Layout chosen in the CMS (`sections.variant`); `null` = default. */
  variant: string | null
}

export interface SectionModule<Schema extends z.ZodType> {
  /** Name shown in the CMS. */
  label: string
  /** Validates `sections.data`. */
  schema: Schema
  /** Public rendering. */
  View: (props: SectionProps<z.infer<Schema>>) => ReactNode
  /**
   * `overlay`: rendered over the card, outside the scrolling content
   * (envelope, music button). Defaults to `flow`.
   */
  placement?: 'flow' | 'overlay'
  /** Layouts the CMS can pick; the first one is the default. */
  variants?: readonly string[]
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
