import type { GuestView } from '@/sections/types'
import type { ReactNode } from 'react'

interface RsvpBarProps {
  guest: GuestView
}

/**
 * Sticky pill at the bottom of the card with the guest's RSVP status and a
 * shortcut to the RSVP section. Server-rendered; refreshed after answering.
 *
 * @param props - Bar props.
 * @param props.guest - Guest whose status is shown.
 */
export function RsvpBar({ guest }: RsvpBarProps): ReactNode {
  const { rsvp } = guest
  let title = 'Confirma tu asistencia'
  let detail = `${guest.maxPasses} ${guest.maxPasses === 1 ? 'pase' : 'pases'} para ti`
  let action = 'Confirmar'

  if (rsvp?.response === 'yes') {
    title = '¡Asistencia confirmada!'
    detail = `${rsvp.passes} ${rsvp.passes === 1 ? 'persona confirmada' : 'personas confirmadas'}`
    action = 'Modificar'
  } else if (rsvp?.response === 'no') {
    title = 'No podrás asistir'
    detail = 'Gracias por avisarnos'
    action = 'Modificar'
  }

  return (
    <div className="pointer-events-none sticky bottom-4 z-10 -mt-16 flex justify-center px-4">
      <a
        className="pointer-events-auto flex w-full max-w-80 items-center gap-3 rounded-full bg-inv-bg/95 py-2 pr-2 pl-3 text-left text-inv-ink shadow-[0_8px_30px_-6px_rgba(0,0,0,0.25)] ring-1 ring-inv-muted/20 backdrop-blur"
        href="#rsvp"
      >
        <span
          aria-hidden="true"
          className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm ${rsvp ? 'bg-inv-primary text-inv-on-primary' : 'bg-inv-surface text-inv-accent'}`}
        >
          {rsvp?.response === 'yes' ? '✓' : rsvp ? '–' : '?'}
        </span>
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-sm font-semibold">{title}</span>
          <span className="truncate text-xs text-inv-muted">{detail}</span>
        </span>
        <span className="rounded-full border border-inv-muted/30 px-3 py-1.5 text-xs font-semibold">
          {action} ›
        </span>
      </a>
    </div>
  )
}
