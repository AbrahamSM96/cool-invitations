import { buttonVariants } from '@/components/ui/button'
import { getAdminEventSummary, isEventId } from '@/data/admin-events'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

/**
 * Event title, public path and "view" link.
 *
 * @param props - Component props.
 * @param props.params - Route params (`id`).
 */
export async function EventHeader({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<ReactNode> {
  const { id } = await params
  if (!isEventId(id)) notFound()
  const event = await getAdminEventSummary(id)
  if (!event) notFound()

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{event.title}</h1>
        <p className="text-sm text-muted-foreground">/e/{event.slug}</p>
      </div>
      {event.status === 'published' ? (
        <a
          className={buttonVariants({ variant: 'outline' })}
          href={`/e/${event.slug}`}
          rel="noreferrer"
          target="_blank"
        >
          Ver invitación
        </a>
      ) : null}
    </div>
  )
}
