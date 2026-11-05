import { ClosingSchema } from './closing/schema'
import { CountdownSchema } from './countdown/schema'
import { DateSchema } from './date/schema'
import { DressCodeSchema } from './dress-code/schema'
import { EnvelopeSchema } from './envelope/schema'
import { GiftsSchema } from './gifts/schema'
import { GuestPassSchema } from './guest-pass/schema'
import { HERO_VARIANTS, HeroSchema } from './hero/schema'
import { IntroSchema } from './intro/schema'
import { MusicSchema } from './music/schema'
import { PeopleSchema } from './people/schema'
import { PhotoSchema } from './photo/schema'
import { RsvpSchema } from './rsvp/schema'
import { VenueSchema } from './venue/schema'

/**
 * What the CMS knows about each section type, without its view. Safe to
 * import in the browser: `registry.ts` adds the server-rendered `View`.
 */
export const sectionCatalog = {
  closing: { label: 'Cierre', schema: ClosingSchema },
  countdown: { label: 'Cuenta regresiva', schema: CountdownSchema },
  date: { label: 'Fecha', schema: DateSchema },
  dress_code: { label: 'Código de vestimenta', schema: DressCodeSchema },
  envelope: {
    label: 'Sobre',
    placement: 'overlay',
    schema: EnvelopeSchema,
  },
  gifts: { label: 'Mesa de regalos', schema: GiftsSchema },
  guest_pass: { label: 'Pase del invitado', schema: GuestPassSchema },
  hero: {
    label: 'Portada',
    schema: HeroSchema,
    variantLabels: { classic: 'Clásica', photo: 'Con foto' },
    variants: HERO_VARIANTS,
  },
  intro: { label: 'Introducción', schema: IntroSchema },
  music: { label: 'Música', placement: 'overlay', schema: MusicSchema },
  people: { label: 'Familia y padrinos', schema: PeopleSchema },
  photo: { label: 'Foto', schema: PhotoSchema },
  rsvp: { label: 'Confirmación', schema: RsvpSchema },
  venue: { label: 'Lugar', schema: VenueSchema },
} as const

export type SectionType = keyof typeof sectionCatalog

/**
 * Type guard for `sections.type` values read from the database.
 *
 * @param type - Raw section type.
 */
export function isSectionType(type: string): type is SectionType {
  return Object.hasOwn(sectionCatalog, type)
}
