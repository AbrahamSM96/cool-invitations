'use client'

import { INVITATION_OPEN_EVENT } from '@/lib/invitation-events'
import { type ReactNode, useState } from 'react'

interface EnvelopeGateProps {
  /** "Abraham y Ana"; `null` on the generic invitation. */
  guestName: string | null
  hint: string
  /** Decoration drawn on the envelope (server-rendered ornament). */
  decoration: ReactNode
}

const OPEN_ANIMATION_MS = 900

/**
 * Closed envelope covering the invitation card. Tapping it plays the
 * opening animation, fires {@link INVITATION_OPEN_EVENT} and unmounts.
 *
 * @param props - Envelope props.
 * @param props.decoration - Ornament drawn above the seal.
 * @param props.guestName - Name printed on the envelope.
 * @param props.hint - Text under the envelope.
 */
export function EnvelopeGate({
  decoration,
  guestName,
  hint,
}: EnvelopeGateProps): ReactNode {
  const [state, setState] = useState<'closed' | 'opening' | 'open'>('closed')

  if (state === 'open') return null

  const opening = state === 'opening'

  return (
    <div
      className={`inv-stage absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 transition-opacity duration-700 ${opening ? 'pointer-events-none opacity-0 delay-300' : ''}`}
    >
      <button
        aria-label="Abrir invitación"
        className={`inv-envelope-paper relative flex aspect-[5/7] w-[72%] max-w-72 flex-col items-center justify-center gap-6 rounded-[3px] text-(--inv-envelope-ink) shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)] transition-transform duration-700 ease-out ${opening ? '-translate-y-6 scale-110' : 'hover:-translate-y-1'}`}
        onClick={() => {
          setState('opening')
          window.dispatchEvent(new Event(INVITATION_OPEN_EVENT))
          setTimeout(() => setState('open'), OPEN_ANIMATION_MS)
        }}
        type="button"
      >
        <span className="opacity-90">{decoration}</span>
        <span
          aria-hidden="true"
          className="size-16 rounded-full bg-(--inv-envelope-seal) shadow-[inset_0_2px_6px_rgba(255,255,255,0.45),inset_0_-3px_6px_rgba(0,0,0,0.25),0_3px_8px_rgba(0,0,0,0.3)] ring-4 ring-(--inv-envelope-seal)/40"
        />
        {guestName ? (
          <span className="flex flex-col items-center gap-1">
            <span className="font-caps text-[10px] tracking-[0.3em] uppercase opacity-80">
              Para
            </span>
            <span className="font-display text-2xl">{guestName}</span>
          </span>
        ) : null}
      </button>
      <p className="font-display text-sm text-inv-muted italic">{hint}</p>
    </div>
  )
}
