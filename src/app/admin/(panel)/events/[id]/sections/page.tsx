import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { SectionsLoader } from './SectionsLoader'

export const metadata: Metadata = { title: 'Secciones' }

/**
 * `/admin/events/{id}/sections`: order, show/hide and fill the sections.
 *
 * @param props - Page props.
 */
export default function SectionsPage(
  props: PageProps<'/admin/events/[id]/sections'>
): ReactNode {
  return (
    <Suspense
      fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}
    >
      <SectionsLoader params={props.params} />
    </Suspense>
  )
}
