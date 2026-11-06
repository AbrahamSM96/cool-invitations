import { SectionFrame } from '@/components/invitation/SectionFrame'
import Image from 'next/image'
import type { ReactNode } from 'react'

import type { SectionProps } from '../types'

import type { PhotoData } from './schema'

/**
 * A single framed photo.
 *
 * @param props - Section props.
 * @param props.data - Section content.
 */
export function PhotoView({ data }: SectionProps<PhotoData>): ReactNode {
  return (
    <SectionFrame className="py-8" tone={data.tone}>
      <div className="inv-photo relative aspect-3/4 w-full overflow-clip bg-inv-surface shadow-sm ring-1 ring-inv-muted/20">
        <Image
          alt={data.alt}
          className="object-cover"
          fill
          sizes="(min-width: 768px) 430px, 100vw"
          src={data.imageUrl}
        />
      </div>
    </SectionFrame>
  )
}
