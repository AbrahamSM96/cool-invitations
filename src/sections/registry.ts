import { ClosingSchema } from './closing/schema'
import { ClosingView } from './closing/View'
import { CountdownSchema } from './countdown/schema'
import { CountdownView } from './countdown/View'
import { DateSchema } from './date/schema'
import { DateView } from './date/View'
import { DressCodeSchema } from './dress-code/schema'
import { DressCodeView } from './dress-code/View'
import { EnvelopeSchema } from './envelope/schema'
import { EnvelopeView } from './envelope/View'
import { GiftsSchema } from './gifts/schema'
import { GiftsView } from './gifts/View'
import { GuestPassSchema } from './guest-pass/schema'
import { GuestPassView } from './guest-pass/View'
import { HERO_VARIANTS, HeroSchema } from './hero/schema'
import { HeroView } from './hero/View'
import { IntroSchema } from './intro/schema'
import { IntroView } from './intro/View'
import { MusicSchema } from './music/schema'
import { MusicView } from './music/View'
import { PeopleSchema } from './people/schema'
import { PeopleView } from './people/View'
import { PhotoSchema } from './photo/schema'
import { PhotoView } from './photo/View'
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
  dress_code: defineSection({
    View: DressCodeView,
    label: 'Código de vestimenta',
    schema: DressCodeSchema,
  }),
  envelope: defineSection({
    View: EnvelopeView,
    label: 'Sobre',
    placement: 'overlay',
    schema: EnvelopeSchema,
  }),
  gifts: defineSection({
    View: GiftsView,
    label: 'Mesa de regalos',
    schema: GiftsSchema,
  }),
  guest_pass: defineSection({
    View: GuestPassView,
    label: 'Pase del invitado',
    schema: GuestPassSchema,
  }),
  hero: defineSection({
    View: HeroView,
    label: 'Portada',
    schema: HeroSchema,
    variants: HERO_VARIANTS,
  }),
  intro: defineSection({
    View: IntroView,
    label: 'Introducción',
    schema: IntroSchema,
  }),
  music: defineSection({
    View: MusicView,
    label: 'Música',
    placement: 'overlay',
    schema: MusicSchema,
  }),
  people: defineSection({
    View: PeopleView,
    label: 'Familia y padrinos',
    schema: PeopleSchema,
  }),
  photo: defineSection({ View: PhotoView, label: 'Foto', schema: PhotoSchema }),
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
