import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { ResponsesLoader } from './ResponsesLoader'

export const metadata: Metadata = { title: 'Respuestas' }

/**
 * `/admin/events/{id}/responses`: RSVP totals, tables and messages.
 *
 * @param props - Page props.
 */
export default function ResponsesPage(
  props: PageProps<'/admin/events/[id]/responses'>
): ReactNode {
  return (
    <Suspense
      fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}
    >
      <ResponsesLoader params={props.params} />
    </Suspense>
  )
}
