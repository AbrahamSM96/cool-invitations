import type { ReactNode } from 'react'

interface SectionHeadingProps {
  /** Small caps label above the title, e.g. "Mesa de regalos". */
  eyebrow?: string
  title?: string
}

/**
 * Eyebrow + title pair used at the top of most sections.
 *
 * @param props - Heading props.
 * @param props.eyebrow - Small caps label.
 * @param props.title - Section title.
 */
export function SectionHeading({
  eyebrow,
  title,
}: SectionHeadingProps): ReactNode {
  return (
    <header className="flex flex-col items-center gap-2">
      {eyebrow ? (
        <p className="font-caps text-xs tracking-[0.3em] text-inv-accent uppercase">
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h2 className="font-display text-4xl leading-tight">{title}</h2>
      ) : null}
    </header>
  )
}
