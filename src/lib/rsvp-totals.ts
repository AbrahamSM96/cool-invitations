interface GuestLike {
  maxPasses: number
  status: 'enabled' | 'disabled'
  rsvp: { response: 'yes' | 'no'; passes: number } | null
}

export interface RsvpTotals {
  /** Enabled guests (passes handed out). */
  guests: number
  /** Sum of passes of enabled guests. */
  passesSent: number
  confirmed: number
  confirmedPasses: number
  declined: number
  pending: number
}

/**
 * Counts answers for dashboards. Disabled passes are left out entirely.
 *
 * @param guests - Guests with their current RSVP.
 */
export function rsvpTotals(guests: readonly GuestLike[]): RsvpTotals {
  const totals: RsvpTotals = {
    confirmed: 0,
    confirmedPasses: 0,
    declined: 0,
    guests: 0,
    passesSent: 0,
    pending: 0,
  }
  for (const guest of guests) {
    if (guest.status === 'disabled') continue
    totals.guests++
    totals.passesSent += guest.maxPasses
    if (!guest.rsvp) totals.pending++
    else if (guest.rsvp.response === 'yes') {
      totals.confirmed++
      totals.confirmedPasses += guest.rsvp.passes
    } else totals.declined++
  }
  return totals
}
