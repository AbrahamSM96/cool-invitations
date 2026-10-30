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
    <section className="flex flex-col items-center gap-6 px-6 py-16 text-center">
      <h2 className="font-display text-3xl">{data.title}</h2>
      <Clock afterText={data.afterText} target={event.startsAt.getTime()} />
    </section>
  )
}
