import type { PublishedEvent } from '@/data/invitations'
import { sections } from '@/sections/registry'
import type { GuestView } from '@/sections/types'
import { templateFontVariables } from '@/templates/fonts'
import { getTemplate, themeToCssVariables } from '@/templates/registry'
import type { ReactNode } from 'react'

interface InvitationProps {
  invitation: PublishedEvent
  guest: GuestView | null
}

/**
 * Renders an event's sections inside its template theme.
 *
 * @param props - Invitation props.
 * @param props.guest - Guest, when the invitation is personalized.
 * @param props.invitation - Event and its enabled sections.
 */
export function Invitation({ guest, invitation }: InvitationProps): ReactNode {
  const { theme } = getTemplate(invitation.templateKey)

  return (
    <main
      className={`${templateFontVariables} flex-1 bg-inv-bg font-body text-inv-ink`}
      style={themeToCssVariables(theme)}
    >
      {invitation.sections.map((section) => {
        const { View } = sections[section.type]
        return (
          <View
            data={section.data as never}
            event={invitation.event}
            guest={guest}
            key={section.id}
          />
        )
      })}
    </main>
  )
}
