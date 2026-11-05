import { Ornament } from '@/components/invitation/Ornament'
import { SectionFrame } from '@/components/invitation/SectionFrame'
import { SectionHeading } from '@/components/invitation/SectionHeading'
import type { ReactNode } from 'react'

import type { SectionProps } from '../types'

import type { IntroData } from './schema'

/**
 * Opening words plus an optional quote or verse.
 *
 * @param props - Section props.
 * @param props.data - Section content.
 * @param props.theme - Template theme.
 */
export function IntroView({ data, theme }: SectionProps<IntroData>): ReactNode {
  return (
    <SectionFrame tone={data.tone}>
      <SectionHeading eyebrow={data.eyebrow} />
      <p className="max-w-sm text-[17px] leading-relaxed">{data.text}</p>
      {data.quote ? (
        <>
          <Ornament className="my-2" kind={theme.ornament} />
          <blockquote className="flex max-w-sm flex-col gap-2">
            <p className="font-display text-2xl leading-snug italic">
              “{data.quote.text}”
            </p>
            {data.quote.reference ? (
              <cite className="font-caps text-xs tracking-[0.25em] text-inv-accent not-italic">
                {data.quote.reference}
              </cite>
            ) : null}
          </blockquote>
        </>
      ) : null}
    </SectionFrame>
  )
}
