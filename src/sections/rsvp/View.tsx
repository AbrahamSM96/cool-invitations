import { SectionFrame } from '@/components/invitation/SectionFrame'
import { SectionHeading } from '@/components/invitation/SectionHeading'
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
    <SectionFrame id="rsvp" tone={data.tone}>
      <SectionHeading title={data.title} />
      {guest ? (
        <p className="text-sm text-inv-muted">
          Confirmación para{' '}
          <strong className="font-semibold text-inv-ink">
            {guest.displayName}
          </strong>
        </p>
      ) : null}
      {data.text ? (
        <p className="max-w-sm font-display text-xl">{data.text}</p>
      ) : null}
      {event.rsvpDeadline ? (
        <p className="font-display text-inv-muted italic">
          Confirma antes del{' '}
          {formatEventDate(event.rsvpDeadline, event.timezone, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      ) : null}
      {guest === null ? <p className="max-w-sm">{data.genericText}</p> : null}
      {guest && !guest.enabled ? (
        <p className="max-w-sm">Este pase ya no está disponible.</p>
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
          voice={event.voice}
        />
      ) : null}
    </SectionFrame>
  )
}
