import { ClosingSchema } from './closing/schema'
import { ClosingView } from './closing/View'
import { CountdownSchema } from './countdown/schema'
import { CountdownView } from './countdown/View'
import { DateSchema } from './date/schema'
import { DateView } from './date/View'
import { HeroSchema } from './hero/schema'
import { HeroView } from './hero/View'
import { RsvpSchema } from './rsvp/schema'
import { RsvpView } from './rsvp/View'
import { defineSection } from './types'
import { VenueSchema } from './venue/schema'
import { VenueView } from './venue/View'

/**
 * Every section type the CMS knows about. Adding a section = one folder with
 * `schema.ts` + `View.tsx` (and later `Editor.tsx`) and one entry here.
 */
export const sections = {
  closing: defineSection({
    View: ClosingView,
    label: 'Cierre',
    schema: ClosingSchema,
  }),
  countdown: defineSection({
    View: CountdownView,
    label: 'Cuenta regresiva',
    schema: CountdownSchema,
  }),
  date: defineSection({ View: DateView, label: 'Fecha', schema: DateSchema }),
  hero: defineSection({ View: HeroView, label: 'Portada', schema: HeroSchema }),
  rsvp: defineSection({
    View: RsvpView,
    label: 'Confirmación',
    schema: RsvpSchema,
  }),
  venue: defineSection({
    View: VenueView,
    label: 'Lugar',
    schema: VenueSchema,
  }),
}

export type SectionType = keyof typeof sections

/**
 * Type guard for `sections.type` values read from the database.
 *
 * @param type - Raw section type.
 */
export function isSectionType(type: string): type is SectionType {
  return Object.hasOwn(sections, type)
}
