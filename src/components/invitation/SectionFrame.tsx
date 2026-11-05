import type { Tone } from '@/sections/shared'
import type { ReactNode } from 'react'

interface SectionFrameProps {
  tone: Tone
  children: ReactNode
  id?: string
  className?: string
}

const TONE_CLASSES: Record<Tone, string> = {
  base: 'bg-inv-bg text-inv-ink',
  soft: 'inv-texture bg-inv-surface text-inv-ink',
  strong: 'bg-inv-strong text-inv-on-strong',
}

/**
 * Band that wraps every section: background tone, spacing and scroll reveal.
 *
 * @param props - Frame props.
 * @param props.children - Section content.
 * @param props.className - Extra classes.
 * @param props.id - Anchor id.
 * @param props.tone - Background band.
 */
export function SectionFrame({
  children,
  className = '',
  id,
  tone,
}: SectionFrameProps): ReactNode {
  return (
    <section
      className={`${TONE_CLASSES[tone]} px-7 py-14 ${className}`}
      id={id}
    >
      <div className="inv-reveal flex flex-col items-center gap-4 text-center">
        {children}
      </div>
    </section>
  )
}
