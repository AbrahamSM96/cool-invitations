import { Badge } from '@/components/ui/badge'
import type { ReactNode } from 'react'

/**
 * RSVP state of a guest: confirmed (with passes), declined or pending.
 *
 * @param props - Component props.
 * @param props.disabled - Pass is disabled.
 * @param props.rsvp - Current answer, if any.
 */
export function RsvpBadge({
  disabled = false,
  rsvp,
}: {
  disabled?: boolean
  rsvp: { response: 'yes' | 'no'; passes: number } | null
}): ReactNode {
  if (disabled) return <Badge variant="outline">Deshabilitado</Badge>
  if (!rsvp) return <Badge variant="secondary">Pendiente</Badge>
  if (rsvp.response === 'no')
    return <Badge variant="destructive">No asiste</Badge>
  return (
    <Badge className="bg-emerald-600 text-white">
      Confirmó {rsvp.passes} {rsvp.passes === 1 ? 'pase' : 'pases'}
    </Badge>
  )
}
