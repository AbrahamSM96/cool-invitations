import { formatEventDate } from '@/lib/dates'
import type { ReactNode } from 'react'

import type { SectionProps } from '../types'

import type { HeroData } from './schema'

/**
 * Opening screen: event title, hosts' names and short date.
 *
 * @param props - Section props.
 * @param props.data - Section content.
 * @param props.event - Event shown in the invitation.
 */
export function HeroView({ data, event }: SectionProps<HeroData>): ReactNode {
  return (
    <section
      className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-cover bg-center px-6 text-center"
      style={data.imageUrl ? { backgroundImage: `url(${data.imageUrl})` } : {}}
    >
      <p className="font-caps text-sm tracking-[0.3em] text-inv-muted uppercase">
        {event.title}
      </p>
      <h1 className="font-display text-6xl leading-tight text-inv-accent sm:text-7xl">
        {event.hostsName}
      </h1>
      <p className="font-caps text-sm tracking-[0.2em] uppercase">
        {formatEventDate(event.startsAt, event.timezone, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </p>
      {event.cityLabel ? (
        <p className="text-inv-muted italic">{event.cityLabel}</p>
      ) : null}
    </section>
  )
}
