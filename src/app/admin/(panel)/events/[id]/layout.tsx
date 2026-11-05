import type { ReactNode } from 'react'
import { Suspense } from 'react'

import { EventHeader } from './EventHeader'
import { EventTabs } from './EventTabs'

/**
 * Event editor shell: title, link to the invitation and the tabs.
 *
 * @param props - Layout props.
 * @param props.children - Active tab.
 * @param props.params - Route params (`id`).
 */
export default function EventLayout({
  children,
  params,
}: LayoutProps<'/admin/events/[id]'>): ReactNode {
  return (
    <div className="flex flex-col gap-6">
      <Suspense
        fallback={<div className="h-12 animate-pulse rounded-lg bg-muted" />}
      >
        <EventHeader params={params} />
      </Suspense>
      <Suspense>
        <EventTabs params={params} />
      </Suspense>
      {children}
    </div>
  )
}
