import { SectionFrame } from '@/components/invitation/SectionFrame'
import { SectionHeading } from '@/components/invitation/SectionHeading'
import type { ReactNode } from 'react'

import type { SectionProps } from '../types'

import { resolveVenue } from './resolve'
import type { VenueData } from './schema'

/**
 * One venue card: round photo, place, address, time and map button. Data
 * comes from the linked event place, overridden by the section's fields.
 *
 * @param props - Section props.
 * @param props.data - Section content.
 * @param props.event - Event shown in the invitation (its places).
 */
export function VenueView({
  data: section,
  event,
}: SectionProps<VenueData>): ReactNode {
  const data = resolveVenue(section, event)
  if (!data) return null

  return (
    <SectionFrame tone={section.tone}>
      <SectionHeading eyebrow={data.eyebrow} title={data.title} />
      <div className="mt-2 flex w-full flex-col items-center gap-2 border border-inv-muted/25 bg-inv-card px-6 py-8">
        {data.imageUrl ? (
          <div
            aria-hidden="true"
            className="mb-2 size-16 rounded-full bg-cover bg-center ring-2 ring-inv-accent/40 ring-offset-2 ring-offset-inv-bg"
            style={{ backgroundImage: `url(${data.imageUrl})` }}
          />
        ) : null}
        {data.placeType ? (
          <p className="font-caps text-xs tracking-[0.25em] text-inv-accent">
            {data.placeType}
          </p>
        ) : null}
        <p className="font-display text-2xl">{data.name}</p>
        <p className="max-w-60 text-sm leading-relaxed text-inv-muted">
          {data.address}
        </p>
        <span className="my-2 h-px w-8 bg-inv-muted/40" />
        {data.time ? (
          <p className="font-display text-3xl font-light">{data.time}</p>
        ) : null}
        {data.note ? (
          <p className="font-caps text-[10px] tracking-[0.25em] text-inv-muted">
            {data.note}
          </p>
        ) : null}
        {data.mapsUrl ? (
          <a
            className="mt-4 bg-inv-primary px-6 py-2.5 font-caps text-[11px] tracking-[0.25em] text-inv-on-primary uppercase shadow-sm"
            href={data.mapsUrl}
            rel="noreferrer"
            target="_blank"
          >
            Ver ubicación
          </a>
        ) : null}
      </div>
    </SectionFrame>
  )
}
