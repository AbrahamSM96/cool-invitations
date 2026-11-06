import { SectionFrame } from '@/components/invitation/SectionFrame'
import { getEventDateParts } from '@/lib/dates'
import type { ReactNode } from 'react'

import type { SectionProps } from '../types'

import type { DateData } from './schema'

/**
 * Date band: weekday, big day number, month in italics and year.
 *
 * @param props - Section props.
 * @param props.data - Section content.
 * @param props.event - Event shown in the invitation.
 */
export function DateView({ data, event }: SectionProps<DateData>): ReactNode {
  const parts = getEventDateParts(event.startsAt, event.timezone)

  return (
    <SectionFrame className="py-12" tone={data.tone}>
      <span className="h-px w-24 bg-inv-accent/60" />
      {/* Small text: band color, not the accent, so it reads on any tone. */}
      <p className="font-caps text-xs tracking-[0.35em] uppercase opacity-80">
        {parts.weekday}
      </p>
      <p className="font-display text-7xl leading-none font-light">
        {parts.day}
      </p>
      <p className="font-display text-2xl text-inv-accent italic">
        de {parts.month}
      </p>
      <p className="font-caps text-sm tracking-[0.35em]">{parts.year}</p>
      <span className="h-px w-24 bg-inv-accent/60" />
    </SectionFrame>
  )
}
