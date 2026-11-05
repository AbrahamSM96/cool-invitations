import type { RsvpTotals } from '@/lib/rsvp-totals'
import type { ReactNode } from 'react'

/**
 * Row of RSVP counters: guests, confirmed, declined, pending.
 *
 * @param props - Component props.
 * @param props.totals - Counts from `rsvpTotals`.
 */
export function RsvpTotalsBar({ totals }: { totals: RsvpTotals }): ReactNode {
  const stats = [
    {
      hint: `${totals.passesSent} pases`,
      label: 'Invitaciones',
      value: totals.guests,
    },
    {
      hint: `${totals.confirmedPasses} de ${totals.passesSent} pases`,
      label: 'Confirmaron',
      value: totals.confirmed,
    },
    { hint: null, label: 'No asisten', value: totals.declined },
    { hint: null, label: 'Pendientes', value: totals.pending },
  ]
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div className="rounded-xl border bg-background p-4" key={stat.label}>
          <dt className="text-xs text-muted-foreground">{stat.label}</dt>
          <dd className="text-2xl font-semibold tabular-nums">{stat.value}</dd>
          {stat.hint ? (
            <dd className="text-xs text-muted-foreground">{stat.hint}</dd>
          ) : null}
        </div>
      ))}
    </dl>
  )
}
