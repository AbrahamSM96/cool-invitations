import { updateEvent } from '@/app/admin/events/actions'
import { EventFormView } from '@/app/admin/events/form/EventFormView'
import { getAdminEventForm, isEventId } from '@/data/admin-events'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

/**
 * Loads the event and renders its base-data form.
 *
 * @param props - Component props.
 * @param props.params - Route params (`id`).
 */
export async function EditEvent({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<ReactNode> {
  const { id } = await params
  if (!isEventId(id)) notFound()

  const event = await getAdminEventForm(id)
  if (!event) notFound()

  return (
    <EventFormView action={updateEvent.bind(null, id)} initialValues={event} />
  )
}
