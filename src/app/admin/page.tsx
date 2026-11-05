import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { AdminHome } from './AdminHome'

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Panel · Cool Invitations',
}

/** Admin home: `/admin`. Placeholder until the events list exists. */
export default function AdminPage(): ReactNode {
  return (
    <Suspense>
      <AdminHome />
    </Suspense>
  )
}
