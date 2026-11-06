import { Invitation } from '@/components/Invitation'
import { isEventId } from '@/data/admin-events'
import { getEventPreview, SAMPLE_GUEST } from '@/data/admin-preview'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { PreviewBridge } from './PreviewBridge'

/**
 * Loads the event (any status) and renders it like the public page.
 *
 * @param props - Component props.
 * @param props.params - Route params (`id`).
 * @param props.searchParams - `guest` and `envelope` switches.
 */
export async function PreviewLoader({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<ReactNode> {
  const [{ id }, query] = await Promise.all([params, searchParams])
  if (!isEventId(id)) notFound()
  const invitation = await getEventPreview(id)
  if (!invitation) notFound()

  const withEnvelope = query.envelope !== '0'
  return (
    <>
      <PreviewBridge />
      <Invitation
        guest={query.guest === '1' ? SAMPLE_GUEST : null}
        invitation={{
          ...invitation,
          sections: withEnvelope
            ? invitation.sections
            : invitation.sections.filter(
                (section) => section.type !== 'envelope'
              ),
        }}
      />
    </>
  )
}
