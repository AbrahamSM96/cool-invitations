import { CalendarSchema } from './calendar/schema'
import { ClosingSchema } from './closing/schema'
import { ContactSchema } from './contact/schema'
import { CountdownSchema } from './countdown/schema'
import { DateSchema } from './date/schema'
import { DressCodeSchema } from './dress-code/schema'
import { EnvelopeSchema } from './envelope/schema'
import { GALLERY_VARIANTS, GallerySchema } from './gallery/schema'
import { GiftsSchema } from './gifts/schema'
import { GuestPassSchema } from './guest-pass/schema'
import { HashtagSchema } from './hashtag/schema'
import { HERO_VARIANTS, HeroSchema } from './hero/schema'
import { IntroSchema } from './intro/schema'
import { ItinerarySchema } from './itinerary/schema'
import { LodgingSchema } from './lodging/schema'
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
  add_to_calendar: { label: 'Agendar fecha', schema: CalendarSchema },
  closing: { label: 'Cierre', schema: ClosingSchema },
  contact: { label: 'Contacto', schema: ContactSchema },
  countdown: { label: 'Cuenta regresiva', schema: CountdownSchema },
  date: { label: 'Fecha', schema: DateSchema },
  dress_code: { label: 'Código de vestimenta', schema: DressCodeSchema },
  envelope: {
    label: 'Sobre',
    placement: 'overlay',
    schema: EnvelopeSchema,
  },
  gallery: {
    label: 'Galería',
    schema: GallerySchema,
    variantLabels: { carousel: 'Carrusel', grid: 'Cuadrícula' },
    variants: GALLERY_VARIANTS,
  },
  gifts: { label: 'Mesa de regalos', schema: GiftsSchema },
  guest_pass: { label: 'Pase del invitado', schema: GuestPassSchema },
  hashtag: { label: 'Hashtag', schema: HashtagSchema },
  hero: {
    label: 'Portada',
    schema: HeroSchema,
    variantLabels: {
      art: 'Arte (imagen completa)',
      classic: 'Clásica',
      photo: 'Con foto',
    },
    variants: HERO_VARIANTS,
  },
  intro: { label: 'Introducción', schema: IntroSchema },
  itinerary: { label: 'Itinerario', schema: ItinerarySchema },
  lodging: { label: 'Hospedaje', schema: LodgingSchema },
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
