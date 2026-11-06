import { SectionFrame } from '@/components/invitation/SectionFrame'
import type { ReactNode } from 'react'

import type { SectionProps } from '../types'

import type { HashtagData } from './schema'

/**
 * Event hashtag in big letters, with a link to Instagram.
 *
 * @param props - Section props.
 * @param props.data - Section content.
 */
export function HashtagView({ data }: SectionProps<HashtagData>): ReactNode {
  const tag = data.hashtag.replace(/^#/, '')
  const href =
    data.instagramUrl ??
    `https://www.instagram.com/explore/tags/${encodeURIComponent(tag)}/`
  return (
    <SectionFrame tone={data.tone}>
      {data.text ? (
        <p className="max-w-72 text-sm leading-relaxed opacity-80">
          {data.text}
        </p>
      ) : null}
      <p className="font-display text-4xl break-all">#{tag}</p>
      <a
        className="mt-2 border border-current px-6 py-2.5 font-caps text-[11px] tracking-[0.25em] uppercase"
        href={href}
        rel="noreferrer"
        target="_blank"
      >
        Ver en Instagram
      </a>
    </SectionFrame>
  )
}
