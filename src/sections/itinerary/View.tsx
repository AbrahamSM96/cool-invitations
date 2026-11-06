import { SectionFrame } from '@/components/invitation/SectionFrame'
import { SectionHeading } from '@/components/invitation/SectionHeading'
import type { ReactNode } from 'react'

import type { SectionProps } from '../types'

import type { ItineraryData } from './schema'

/**
 * Timeline of the event: time on the left, activity on the right.
 *
 * @param props - Section props.
 * @param props.data - Section content.
 */
export function ItineraryView({
  data,
}: SectionProps<ItineraryData>): ReactNode {
  return (
    <SectionFrame tone={data.tone}>
      <SectionHeading eyebrow={data.eyebrow} title={data.title} />
      <ol className="inv-stagger mt-2 flex w-full max-w-80 flex-col">
        {data.items.map((item, index) => (
          <li
            className="grid grid-cols-[5.5rem_1px_1fr] gap-x-4 text-left"
            // Admin-ordered list without ids.
            // oxlint-disable-next-line react/no-array-index-key
            key={index}
          >
            <p className="pt-0.5 text-right font-display text-lg leading-tight">
              {item.time}
            </p>
            <span className="relative bg-inv-accent/40">
              <span className="absolute top-2 -left-1 size-2.25 rounded-full bg-inv-accent" />
            </span>
            <div className="pb-7">
              <p className="font-caps text-xs tracking-[0.2em] uppercase">
                {item.activity}
              </p>
              {item.detail ? (
                <p className="mt-1 text-sm text-inv-muted">{item.detail}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </SectionFrame>
  )
}
