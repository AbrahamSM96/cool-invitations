import { ClientLinkCard } from '@/app/admin/events/guests/ClientLinkCard'
import { GuestsManager } from '@/app/admin/events/guests/GuestsManager'
import { RsvpTotalsBar } from '@/components/admin/RsvpTotalsBar'
import { isEventId } from '@/data/admin-events'
import { getAdminGuests } from '@/data/admin-guests'
import { rsvpTotals } from '@/lib/rsvp-totals'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

/**
 * Loads the guests and renders totals plus the manager.
 *
 * @param props - Component props.
 * @param props.params - Route params (`id`).
 */
export async function GuestsLoader({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<ReactNode> {
  const { id } = await params
  if (!isEventId(id)) notFound()
  const page = await getAdminGuests(id)
  if (!page) notFound()

  return (
    <div className="flex flex-col gap-6">
      <ClientLinkCard clientToken={page.event.clientToken} eventId={id} />
      <RsvpTotalsBar totals={rsvpTotals(page.guests)} />
      <GuestsManager
        eventId={id}
        eventSlug={page.event.slug}
        guests={page.guests}
        published={page.event.status === 'published'}
      />
    </div>
  )
}
