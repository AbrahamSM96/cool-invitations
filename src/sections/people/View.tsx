import { SectionFrame } from '@/components/invitation/SectionFrame'
import { SectionHeading } from '@/components/invitation/SectionHeading'
import type { ReactNode } from 'react'

import type { SectionProps } from '../types'

import type { PeopleData } from './schema'

/**
 * Parents, godparents, grandparents... Two groups sit side by side.
 *
 * @param props - Section props.
 * @param props.data - Section content.
 */
export function PeopleView({ data }: SectionProps<PeopleData>): ReactNode {
  const columns =
    data.groups.length === 2 ? 'grid-cols-2 divide-x' : 'grid-cols-1 gap-y-6'

  return (
    <SectionFrame tone={data.tone}>
      <SectionHeading eyebrow={data.eyebrow} />
      {data.title ? (
        <p className="max-w-xs font-display text-2xl leading-snug">
          {data.title}
        </p>
      ) : null}
      <div className={`mt-2 grid w-full divide-inv-muted/30 ${columns}`}>
        {data.groups.map((group) => (
          <div
            className="flex flex-col items-center gap-2 px-3"
            key={group.title}
          >
            <p className="font-caps text-[10px] tracking-[0.25em] text-inv-accent uppercase">
              {group.title}
            </p>
            {group.names.map((name) => (
              <p
                className="font-display text-lg leading-snug italic"
                key={name}
              >
                {name}
              </p>
            ))}
          </div>
        ))}
      </div>
    </SectionFrame>
  )
}
