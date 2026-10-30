import { EventInvitation } from '@/components/EventInvitation'
import { type ReactNode, Suspense } from 'react'

/**
 * Generic invitation: `/e/{event}`.
 *
 * @param props - Page props.
 */
export default function EventPage(props: PageProps<'/e/[event]'>): ReactNode {
  return (
    <Suspense>
      <EventInvitation params={props.params} />
    </Suspense>
  )
}
