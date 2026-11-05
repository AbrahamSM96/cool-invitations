import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { EditEvent } from './EditEvent'

export const metadata: Metadata = { title: 'Editar evento' }

/**
 * `/admin/events/{id}`: edit an event's base data.
 *
 * @param props - Page props.
 */
export default function EditEventPage(
  props: PageProps<'/admin/events/[id]'>
): ReactNode {
  return (
    <Suspense
      fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}
    >
      <EditEvent params={props.params} />
    </Suspense>
  )
}
