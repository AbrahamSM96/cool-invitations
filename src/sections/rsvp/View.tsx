import { formatEventDate } from '@/lib/dates'
import type { ReactNode } from 'react'

import type { SectionProps } from '../types'

import { RsvpForm } from './RsvpForm'
import type { RsvpData } from './schema'

/**
 * RSVP block. Only personalized invitations get the (client) form; the
 * generic invitation renders static text.
 *
 * @param props - Section props.
 * @param props.data - Section content.
 * @param props.event - Event shown in the invitation.
 * @param props.guest - Guest, when the invitation is personalized.
 */
export function RsvpView({
  data,
  event,
  guest,
}: SectionProps<RsvpData>): ReactNode {
  return (
    <section
      className="flex flex-col items-center gap-6 px-6 py-16 text-center"
      id="rsvp"
    >
      <h2 className="font-display text-4xl">{data.title}</h2>
      {event.rsvpDeadline ? (
        <p className="text-inv-muted">
          Confirma antes del{' '}
          {formatEventDate(event.rsvpDeadline, event.timezone, {
            day: 'numeric',
            month: 'long',
          })}
        </p>
      ) : null}
      {guest === null ? <p className="max-w-md">{data.genericText}</p> : null}
      {guest && !guest.enabled ? (
        <p className="max-w-md">Este pase ya no está disponible.</p>
      ) : null}
      {guest?.enabled ? (
        <RsvpForm
          askMessage={data.askMessage}
          current={guest.rsvp}
          declinedText={data.declinedText}
          displayName={guest.displayName}
          maxPasses={guest.maxPasses}
          thanksText={data.thanksText}
          token={guest.token}
        />
      ) : null}
    </section>
  )
}
