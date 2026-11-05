import { Ornament } from '@/components/invitation/Ornament'
import { SectionFrame } from '@/components/invitation/SectionFrame'
import { formatEventDate } from '@/lib/dates'
import type { ReactNode } from 'react'

import type { SectionProps } from '../types'

import type { ClosingData } from './schema'

/**
 * Final message, then a dark footer band with the signature, date and city.
 *
 * @param props - Section props.
 * @param props.data - Section content.
 * @param props.event - Event shown in the invitation.
 * @param props.theme - Template theme.
 */
export function ClosingView({
  data,
  event,
  theme,
}: SectionProps<ClosingData>): ReactNode {
  const date = formatEventDate(event.startsAt, event.timezone)

  return (
    <>
      <SectionFrame tone={data.tone}>
        <p className="max-w-sm font-display text-xl leading-relaxed italic">
          {data.message}
        </p>
        <Ornament kind={theme.ornament} />
      </SectionFrame>
      <footer className="flex flex-col items-center gap-1 bg-inv-strong px-6 py-8 pb-24 text-center text-inv-on-strong">
        <p className="font-display text-xl text-inv-accent italic">
          {data.signature}
        </p>
        <p className="font-caps text-[10px] tracking-[0.25em] uppercase opacity-80">
          {[date, event.cityLabel].filter(Boolean).join(' · ')}
        </p>
      </footer>
    </>
  )
}
