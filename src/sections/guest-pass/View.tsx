import { SectionFrame } from '@/components/invitation/SectionFrame'
import type { ReactNode } from 'react'

import type { SectionProps } from '../types'

import type { GuestPassData } from './schema'

/**
 * "Invitación válida para": guest name, passes, table and personal message.
 * Renders nothing on the generic invitation.
 *
 * @param props - Section props.
 * @param props.data - Section content.
 * @param props.guest - Guest, when the invitation is personalized.
 */
export function GuestPassView({
  data,
  guest,
}: SectionProps<GuestPassData>): ReactNode {
  if (!guest) return null

  return (
    <SectionFrame tone={data.tone}>
      <p className="font-script text-4xl text-inv-accent">{data.title}</p>
      <p className="font-display text-3xl">{guest.displayName}</p>
      <dl className="flex gap-10">
        <div className="flex flex-col items-center">
          <dt className="font-caps text-[10px] tracking-[0.25em] text-inv-accent uppercase">
            Pases
          </dt>
          <dd className="font-display text-3xl">{guest.maxPasses}</dd>
        </div>
        {guest.table ? (
          <div className="flex flex-col items-center">
            <dt className="font-caps text-[10px] tracking-[0.25em] text-inv-accent uppercase">
              Mesa
            </dt>
            <dd className="font-display text-3xl">{guest.table}</dd>
          </div>
        ) : null}
      </dl>
      {guest.personalMessage ? (
        <p className="max-w-sm font-display text-lg italic">
          {guest.personalMessage}
        </p>
      ) : null}
    </SectionFrame>
  )
}
