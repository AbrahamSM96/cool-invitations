import type { OrnamentKind } from '@/templates/types'
import type { ReactNode } from 'react'

interface OrnamentProps {
  kind: OrnamentKind
  className?: string
}

const LEAF = 'M0 0 C3 -4 8 -4 11 0 C8 4 3 4 0 0 Z'

const FLOURISH_HALF = [
  'M80 16 C70 16 64 6 54 6 C44 6 42 18 50 20 C56 21 58 13 52 12',
  'M54 6 C40 2 26 10 18 16 C12 20 6 18 4 14',
  'M66 14 C60 24 46 28 36 24',
]

/**
 * Decorative divider drawn in the template's accent color.
 * `sprig`: leafy branch (botanical weddings). `flourish`: gold scroll (XV).
 *
 * @param props - Ornament props.
 * @param props.className - Extra classes (size, color, margin).
 * @param props.kind - Ornament style from the template.
 */
export function Ornament({ className = '', kind }: OrnamentProps): ReactNode {
  // Accent color unless the caller sets its own text color.
  const color = className.includes('text-') ? '' : 'text-inv-accent'

  if (kind === 'flourish') {
    return (
      <svg
        aria-hidden="true"
        className={`mx-auto h-8 w-40 ${color} ${className}`}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.2"
        viewBox="0 0 160 32"
      >
        {['', 'matrix(-1 0 0 1 160 0)'].map((transform) => (
          <g key={transform || 'left'} transform={transform || undefined}>
            {FLOURISH_HALF.map((d) => (
              <path d={d} key={d} />
            ))}
          </g>
        ))}
        <path
          d="M80 8 L84 16 L80 24 L76 16 Z"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    )
  }

  return (
    <svg
      aria-hidden="true"
      className={`mx-auto h-6 w-32 ${color} ${className}`}
      fill="none"
      viewBox="0 0 128 24"
    >
      <path
        d="M8 14 Q64 4 120 14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1"
      />
      <g fill="currentColor" opacity="0.75">
        <path d={LEAF} transform="translate(28 11) rotate(-35)" />
        <path d={LEAF} transform="translate(30 12) rotate(30)" />
        <path d={LEAF} transform="translate(48 8) rotate(-30)" />
        <path d={LEAF} transform="translate(50 9) rotate(35)" />
        <path d={LEAF} transform="translate(69 8) rotate(-150)" />
        <path d={LEAF} transform="translate(67 9) rotate(145)" />
        <path d={LEAF} transform="translate(89 11) rotate(-145)" />
        <path d={LEAF} transform="translate(87 12) rotate(150)" />
      </g>
      <circle cx="64" cy="8.5" fill="currentColor" r="2" />
    </svg>
  )
}
