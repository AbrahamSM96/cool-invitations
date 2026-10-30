import { getEventDateParts } from '@/lib/dates'
import type { ReactNode } from 'react'

import type { SectionProps } from '../types'

import type { DateData } from './schema'

/**
 * Big date block: weekday · day · month, year and time.
 *
 * @param props - Section props.
 * @param props.data - Section content.
 * @param props.event - Event shown in the invitation.
 */
export function DateView({ data, event }: SectionProps<DateData>): ReactNode {
  const parts = getEventDateParts(event.startsAt, event.timezone)

  return (
    <section className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <h2 className="font-display text-3xl">{data.title}</h2>
      <div className="flex items-center gap-4 font-caps tracking-[0.2em] uppercase">
        <span className="w-24 border-y border-inv-muted py-2 text-sm">
          {parts.weekday}
        </span>
        <span className="font-display text-6xl text-inv-accent">
          {parts.day}
        </span>
        <span className="w-24 border-y border-inv-muted py-2 text-sm">
          {parts.month}
        </span>
      </div>
      <p className="font-caps tracking-[0.3em]">{parts.year}</p>
      <p className="text-inv-muted">{parts.time}</p>
    </section>
  )
}
