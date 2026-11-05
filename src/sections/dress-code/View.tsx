import { SectionFrame } from '@/components/invitation/SectionFrame'
import { SectionHeading } from '@/components/invitation/SectionHeading'
import type { ReactNode } from 'react'

import type { SectionProps } from '../types'

import type { DressCodeData } from './schema'

/**
 * Dress code with an optional color palette.
 *
 * @param props - Section props.
 * @param props.data - Section content.
 */
export function DressCodeView({
  data,
}: SectionProps<DressCodeData>): ReactNode {
  return (
    <SectionFrame tone={data.tone}>
      <SectionHeading eyebrow={data.eyebrow} title={data.code} />
      {data.description ? (
        <p className="max-w-sm leading-relaxed">{data.description}</p>
      ) : null}
      {data.palette.length > 0 ? (
        <ul aria-label="Paleta de colores" className="mt-2 flex gap-2">
          {data.palette.map((color) => (
            <li
              className="size-7 rounded-full ring-1 ring-black/10"
              key={color}
              style={{ backgroundColor: color }}
            />
          ))}
        </ul>
      ) : null}
      {data.paletteNote ? (
        <p className="font-display text-lg text-inv-primary italic">
          {data.paletteNote}
        </p>
      ) : null}
      {data.reservedNote ? (
        <>
          <span className="h-px w-12 bg-inv-accent/50" />
          <p className="text-sm text-inv-muted">{data.reservedNote}</p>
        </>
      ) : null}
    </SectionFrame>
  )
}
