import type { ReactNode } from 'react'

import type { SectionProps } from '../types'

import type { ClosingData } from './schema'

/**
 * Final message and signature.
 *
 * @param props - Section props.
 * @param props.data - Section content.
 */
export function ClosingView({ data }: SectionProps<ClosingData>): ReactNode {
  return (
    <section className="flex flex-col items-center gap-6 px-6 py-24 text-center">
      <p className="max-w-md text-lg">{data.message}</p>
      <p className="font-display text-3xl text-inv-accent">{data.signature}</p>
    </section>
  )
}
