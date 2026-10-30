import { getPublishedEvent } from '@/data/invitations'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import { Invitation } from './Invitation'

/**
 * Generic invitation (no guest data). Fully cacheable.
 *
 * @param props - Route params.
 * @param props.params - `{ event }` from the URL.
 */
export async function EventInvitation({
  params,
}: Pick<PageProps<'/e/[event]'>, 'params'>): Promise<ReactNode> {
  const { event: slug } = await params
  const invitation = await getPublishedEvent(slug)

  if (!invitation) notFound()

  return <Invitation guest={null} invitation={invitation} />
}
