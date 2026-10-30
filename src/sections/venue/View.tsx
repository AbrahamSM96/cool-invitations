import type { ReactNode } from 'react'

import type { SectionProps } from '../types'

import type { VenueData } from './schema'

/**
 * One venue (ceremony, reception, party...) with time, address and map link.
 *
 * @param props - Section props.
 * @param props.data - Section content.
 */
export function VenueView({ data }: SectionProps<VenueData>): ReactNode {
  return (
    <section className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <h2 className="font-caps text-sm tracking-[0.3em] text-inv-muted uppercase">
        {data.role}
      </h2>
      <p className="font-display text-4xl text-inv-accent">{data.name}</p>
      <p className="font-caps tracking-[0.2em]">{data.time}</p>
      <p className="max-w-sm">{data.address}</p>
      {data.note ? <p className="text-inv-muted italic">{data.note}</p> : null}
      {data.mapsUrl ? (
        <a
          className="mt-2 rounded-full bg-inv-accent px-6 py-2 font-caps text-xs tracking-widest text-inv-on-accent uppercase"
          href={data.mapsUrl}
          rel="noreferrer"
          target="_blank"
        >
          Ver ubicación
        </a>
      ) : null}
    </section>
  )
}
