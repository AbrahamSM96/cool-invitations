'use client'

import { INVITATION_OPEN_EVENT } from '@/lib/invitation-events'
import { type ReactNode, useState } from 'react'

interface EnvelopeGateProps {
  /** "Abraham y Ana"; `null` on the generic invitation. */
  guestName: string | null
  hint: string
  /** Initials stamped on the seal, e.g. "V&D". */
  monogram: string
  /** Ornament (server-rendered) used when the theme has no decoration. */
  decoration: ReactNode
}

/** Until the overlay is removed: seal fades, flaps swing, all fades. */
const OPEN_ANIMATION_MS = 1600

/**
 * Closed envelope covering the invitation card. Tapping it breaks the
 * seal, swings both flaps open, fires {@link INVITATION_OPEN_EVENT} (music
 * starts) and unmounts. Styles live in `globals.css` (`.inv-env*`).
 *
 * @param props - Envelope props.
 * @param props.decoration - Ornament used without a decoration picture.
 * @param props.guestName - Name printed on the envelope.
 * @param props.hint - Text under the envelope.
 * @param props.monogram - Initials on the seal.
 */
export function EnvelopeGate({
  decoration,
  guestName,
  hint,
  monogram,
}: EnvelopeGateProps): ReactNode {
  const [state, setState] = useState<'closed' | 'opening' | 'open'>('closed')
  if (state === 'open') return null

  /** Starts the opening animation and the music. */
  function open(): void {
    if (state !== 'closed') return
    setState('opening')
    window.dispatchEvent(new Event(INVITATION_OPEN_EVENT))
    setTimeout(() => setState('open'), OPEN_ANIMATION_MS)
  }

  return (
    <div className="inv-env-overlay" data-state={state}>
      <button
        aria-label="Abrir invitación"
        className="inv-env"
        onClick={open}
        type="button"
      >
        <span aria-hidden="true" className="inv-env-body inv-envelope-paper" />
        <span
          aria-hidden="true"
          className="inv-env-flap inv-env-flap-left inv-envelope-paper"
        />
        <span
          aria-hidden="true"
          className="inv-env-flap inv-env-flap-right inv-envelope-paper"
        />

        <span aria-hidden="true" className="inv-env-decoration">
          <span className="inv-env-sprig" />
          <span className="inv-env-ornament text-(--inv-envelope-ink)">
            {decoration}
          </span>
        </span>

        <span aria-hidden="true" className="inv-env-seal">
          <span className="inv-env-seal-art" />
          <span className="inv-env-monogram font-display">{monogram}</span>
        </span>

        {guestName ? (
          <span className="inv-env-recipient text-(--inv-envelope-ink)">
            <span className="font-caps text-[10px] tracking-[0.3em] uppercase opacity-85">
              Para
            </span>
            <span className="font-display text-2xl leading-tight">
              {guestName}
            </span>
          </span>
        ) : null}
      </button>
      <p className="inv-env-hint font-display text-sm italic">{hint}</p>
    </div>
  )
}
