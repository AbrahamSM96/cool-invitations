import { SectionFrame } from '@/components/invitation/SectionFrame'
import type { ReactNode } from 'react'

import type { SectionProps } from '../types'

import { Clock } from './Clock'
import type { CountdownData } from './schema'

/**
 * Countdown to `events.starts_at`.
 *
 * @param props - Section props.
 * @param props.data - Section content.
 * @param props.event - Event shown in the invitation.
 */
export function CountdownView({
  data,
  event,
}: SectionProps<CountdownData>): ReactNode {
  return (
    <SectionFrame tone={data.tone}>
      <p className="font-display text-2xl italic">{data.title}</p>
      <Clock afterText={data.afterText} target={event.startsAt.getTime()} />
    </SectionFrame>
  )
}
