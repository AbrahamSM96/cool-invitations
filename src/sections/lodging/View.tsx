import { SectionFrame } from '@/components/invitation/SectionFrame'
import { SectionHeading } from '@/components/invitation/SectionHeading'
import type { ReactNode } from 'react'

import type { SectionProps } from '../types'

import type { LodgingData } from './schema'

const LINK =
  'border border-inv-primary px-4 py-2 font-caps text-[10px] tracking-[0.2em] uppercase'

/**
 * Recommended hotels: name, address, special rate and booking / map links.
 *
 * @param props - Section props.
 * @param props.data - Section content.
 */
export function LodgingView({ data }: SectionProps<LodgingData>): ReactNode {
  return (
    <SectionFrame tone={data.tone}>
      <SectionHeading eyebrow={data.eyebrow} title={data.title} />
      {data.text ? (
        <p className="max-w-72 text-sm leading-relaxed text-inv-muted">
          {data.text}
        </p>
      ) : null}
      <ul className="inv-stagger mt-2 flex w-full flex-col gap-4">
        {data.hotels.map((hotel) => (
          <li
            className="flex flex-col items-center gap-2 border border-inv-muted/25 bg-inv-card px-6 py-6"
            key={hotel.name}
          >
            <p className="font-display text-2xl">{hotel.name}</p>
            {hotel.address ? (
              <p className="max-w-60 text-sm text-inv-muted">{hotel.address}</p>
            ) : null}
            {hotel.discountCode ? (
              <p className="mt-1 border border-dashed border-inv-accent px-3 py-1.5 text-sm">
                {hotel.discountCode}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {hotel.url ? (
                <a
                  className={`${LINK} bg-inv-primary text-inv-on-primary`}
                  href={hotel.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  Reservar
                </a>
              ) : null}
              {hotel.phone ? (
                <a
                  className={LINK}
                  href={`tel:${hotel.phone.replaceAll(/[^\d+]/g, '')}`}
                >
                  Llamar
                </a>
              ) : null}
              {hotel.mapsUrl ? (
                <a
                  className={LINK}
                  href={hotel.mapsUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Ubicación
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </SectionFrame>
  )
}
