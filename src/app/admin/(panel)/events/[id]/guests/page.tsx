import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { GuestsLoader } from './GuestsLoader'

export const metadata: Metadata = { title: 'Invitados' }

/**
 * `/admin/events/{id}/guests`: the guest list and RSVP totals.
 *
 * @param props - Page props.
 */
export default function GuestsPage(
  props: PageProps<'/admin/events/[id]/guests'>
): ReactNode {
  return (
    <Suspense
      fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}
    >
      <GuestsLoader params={props.params} />
    </Suspense>
  )
}
