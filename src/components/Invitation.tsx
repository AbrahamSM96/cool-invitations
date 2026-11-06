import type { PublishedEvent } from '@/data/invitations'
import { sections } from '@/sections/registry'
import type { GuestView } from '@/sections/types'
import { templateFontVariables } from '@/templates/fonts'
import { applyOverrides } from '@/templates/overrides'
import { getTemplate, themeToCssVariables } from '@/templates/registry'
import type { ReactNode } from 'react'

import { MotionFallback } from './invitation/MotionFallback'
import { RsvpBar } from './invitation/RsvpBar'

interface InvitationProps {
  invitation: PublishedEvent
  guest: GuestView | null
}

/**
 * Renders an event inside its template: a phone-sized card that fills the
 * screen on mobile and floats over the template's stage on wider screens.
 * Overlay sections (envelope, music) sit outside the scrolling content.
 *
 * @param props - Invitation props.
 * @param props.guest - Guest, when the invitation is personalized.
 * @param props.invitation - Event and its enabled sections.
 */
export function Invitation({ guest, invitation }: InvitationProps): ReactNode {
  const theme = applyOverrides(
    getTemplate(invitation.templateKey).theme,
    invitation.themeOverrides
  )
  const hasRsvp = invitation.sections.some((section) => section.type === 'rsvp')

  const rendered = invitation.sections.map((section) => {
    const sectionModule = sections[section.type]
    const { View } = sectionModule
    const element = (
      <View
        data={section.data as never}
        event={invitation.event}
        guest={guest}
        key={section.id}
        theme={theme}
        variant={section.variant}
      />
    )
    return { element, overlay: sectionModule.placement === 'overlay' }
  })

  return (
    <div
      className={`${templateFontVariables} inv-stage fixed inset-0 flex items-center justify-center font-body text-inv-ink md:p-8`}
      data-invitation-theme=""
      data-motion={theme.motion ?? 'soft'}
      style={themeToCssVariables(theme)}
    >
      <div className="relative h-svh w-full overflow-hidden bg-inv-bg md:h-[min(880px,calc(100svh-4rem))] md:max-w-[440px] md:rounded-[4px] md:shadow-[0_30px_80px_-20px_rgba(40,30,20,0.45)]">
        <main className="h-full overflow-y-auto overscroll-contain scroll-smooth">
          {rendered.filter((item) => !item.overlay).map((item) => item.element)}
          {guest?.enabled && hasRsvp ? <RsvpBar guest={guest} /> : null}
        </main>
        {rendered.filter((item) => item.overlay).map((item) => item.element)}
        <MotionFallback />
      </div>
    </div>
  )
}
