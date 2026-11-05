import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { ClientPageLoader } from './ClientPageLoader'

// Generic title: link previews must not reveal names.
export const metadata: Metadata = { title: 'Tus invitados' }

/**
 * `/c/{client_token}`: the client's private guest list, with WhatsApp
 * buttons and live RSVP state. Read-only.
 *
 * @param props - Page props.
 */
export default function ClientPage(props: PageProps<'/c/[token]'>): ReactNode {
  return (
    <Suspense
      fallback={<div className="m-4 h-96 animate-pulse rounded-xl bg-muted" />}
    >
      <ClientPageLoader params={props.params} />
    </Suspense>
  )
}
