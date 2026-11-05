import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { PreviewLoader } from './PreviewLoader'

export const metadata: Metadata = { title: 'Vista previa' }

/**
 * `/admin/preview/{id}`: the invitation as guests would see it, drafts
 * included. `?guest=1` adds a sample guest; `?envelope=0` skips the envelope.
 *
 * @param props - Page props.
 */
export default function PreviewPage(
  props: PageProps<'/admin/preview/[id]'>
): ReactNode {
  return (
    <Suspense>
      <PreviewLoader params={props.params} searchParams={props.searchParams} />
    </Suspense>
  )
}
