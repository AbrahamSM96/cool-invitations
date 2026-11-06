import { SectionFrame } from '@/components/invitation/SectionFrame'
import { SectionHeading } from '@/components/invitation/SectionHeading'
import Image from 'next/image'
import type { ReactNode } from 'react'

import type { SectionProps } from '../types'

import type { GalleryData } from './schema'

/**
 * Several photos: a swipeable carousel (CSS scroll snap, no JS) or a
 * two-column grid.
 *
 * @param props - Section props.
 * @param props.data - Section content.
 * @param props.variant - `carousel` (default) or `grid`.
 */
export function GalleryView({
  data,
  variant,
}: SectionProps<GalleryData>): ReactNode {
  const grid = variant === 'grid'
  return (
    <SectionFrame className="px-0" tone={data.tone}>
      <div className="px-7">
        <SectionHeading eyebrow={data.eyebrow} title={data.title} />
      </div>
      {grid ? (
        <ul className="inv-stagger inv-stagger-row grid w-full grid-cols-2 gap-1.5 px-7">
          {data.photos.map((photo, index) => (
            <li
              className="relative aspect-square overflow-hidden bg-inv-surface"
              key={photo.url}
            >
              <Image
                alt={photo.alt ?? ''}
                className="object-cover"
                fill
                loading={index < 4 ? 'eager' : 'lazy'}
                sizes="(min-width: 768px) 215px, 50vw"
                src={photo.url}
              />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex w-full snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto scroll-smooth px-7 pb-2">
          {data.photos.map((photo) => (
            <li
              className="relative aspect-3/4 w-[78%] shrink-0 snap-center overflow-hidden bg-inv-surface shadow-sm"
              key={photo.url}
            >
              <Image
                alt={photo.alt ?? ''}
                className="object-cover"
                fill
                sizes="(min-width: 768px) 340px, 78vw"
                src={photo.url}
              />
            </li>
          ))}
        </ul>
      )}
      {!grid && data.photos.length > 1 ? (
        <p className="font-caps text-[10px] tracking-[0.25em] text-inv-muted uppercase">
          Desliza para ver más
        </p>
      ) : null}
    </SectionFrame>
  )
}
