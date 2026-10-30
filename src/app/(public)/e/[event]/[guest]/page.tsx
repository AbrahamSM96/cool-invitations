import { GuestInvitation } from '@/components/GuestInvitation'
import { type ReactNode, Suspense } from 'react'

/**
 * Personalized invitation: `/e/{event}/{guest-slug}-{token}`.
 *
 * @param props - Page props.
 */
export default function GuestPage(
  props: PageProps<'/e/[event]/[guest]'>
): ReactNode {
  return (
    <Suspense>
      <GuestInvitation params={props.params} />
    </Suspense>
  )
}
