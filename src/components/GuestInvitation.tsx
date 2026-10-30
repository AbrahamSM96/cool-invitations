import { getGuest, getPublishedEvent } from '@/data/invitations'
import { guestPathSegment, parseGuestPathSegment } from '@/lib/tokens'
import { notFound, redirect } from 'next/navigation'
import type { ReactNode } from 'react'

import { Invitation } from './Invitation'

/**
 * Personalized invitation. The event part comes from cache; the guest part is
 * read on every request.
 *
 * @param props - Route params.
 * @param props.params - `{ event, guest }` from the URL.
 */
export async function GuestInvitation({
  params,
}: Pick<PageProps<'/e/[event]/[guest]'>, 'params'>): Promise<ReactNode> {
  const { event: eventSlug, guest: segment } = await params
  const parsed = parseGuestPathSegment(segment)
  if (!parsed) notFound()

  const invitation = await getPublishedEvent(eventSlug)
  if (!invitation) notFound()

  const guest = await getGuest(invitation.event.id, parsed.token)
  if (!guest) notFound()

  // The token is what matters; fix the slug part if the guest was renamed.
  if (guest.slug !== parsed.slug) {
    redirect(`/e/${eventSlug}/${guestPathSegment(guest.slug, guest.token)}`)
  }

  return <Invitation guest={guest} invitation={invitation} />
}
