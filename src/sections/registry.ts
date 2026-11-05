import { sectionCatalog } from './catalog'
import { ClosingView } from './closing/View'
import { CountdownView } from './countdown/View'
import { DateView } from './date/View'
import { DressCodeView } from './dress-code/View'
import { EnvelopeView } from './envelope/View'
import { GiftsView } from './gifts/View'
import { GuestPassView } from './guest-pass/View'
import { HeroView } from './hero/View'
import { IntroView } from './intro/View'
import { MusicView } from './music/View'
import { PeopleView } from './people/View'
import { PhotoView } from './photo/View'
import { RsvpView } from './rsvp/View'
import { defineSection } from './types'
import { VenueView } from './venue/View'

/**
 * Every section type with its public view. Adding a section = one folder with
 * `schema.ts` + `View.tsx`, one entry in `catalog.ts` and one here.
 */
export const sections = {
  closing: defineSection({ ...sectionCatalog.closing, View: ClosingView }),
  countdown: defineSection({
    ...sectionCatalog.countdown,
    View: CountdownView,
  }),
  date: defineSection({ ...sectionCatalog.date, View: DateView }),
  dress_code: defineSection({
    ...sectionCatalog.dress_code,
    View: DressCodeView,
  }),
  envelope: defineSection({ ...sectionCatalog.envelope, View: EnvelopeView }),
  gifts: defineSection({ ...sectionCatalog.gifts, View: GiftsView }),
  guest_pass: defineSection({
    ...sectionCatalog.guest_pass,
    View: GuestPassView,
  }),
  hero: defineSection({ ...sectionCatalog.hero, View: HeroView }),
  intro: defineSection({ ...sectionCatalog.intro, View: IntroView }),
  music: defineSection({ ...sectionCatalog.music, View: MusicView }),
  people: defineSection({ ...sectionCatalog.people, View: PeopleView }),
  photo: defineSection({ ...sectionCatalog.photo, View: PhotoView }),
  rsvp: defineSection({ ...sectionCatalog.rsvp, View: RsvpView }),
  venue: defineSection({ ...sectionCatalog.venue, View: VenueView }),
}

export { isSectionType, type SectionType } from './catalog'
