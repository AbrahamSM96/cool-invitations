import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { DesignLoader } from './DesignLoader'

export const metadata: Metadata = { title: 'Diseño' }

/**
 * `/admin/events/{id}/design`: the event's own colors, fonts and pictures.
 *
 * @param props - Page props.
 */
export default function DesignPage(
  props: PageProps<'/admin/events/[id]/design'>
): ReactNode {
  return (
    <Suspense
      fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}
    >
      <DesignLoader params={props.params} />
    </Suspense>
  )
}
