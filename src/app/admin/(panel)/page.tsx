import { buttonVariants } from '@/components/ui/button'
import type { Metadata } from 'next'
import Link from 'next/link'
import { type ReactNode, Suspense } from 'react'

import { EventsTable } from './EventsTable'

export const metadata: Metadata = { title: 'Eventos' }

/** Admin home: `/admin`, the list of events. */
export default function EventsPage(): ReactNode {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Eventos</h1>
          <p className="text-sm text-muted-foreground">
            Bodas, XV años y fiestas que administras.
          </p>
        </div>
        <Link className={buttonVariants()} href="/admin/events/new">
          Nuevo evento
        </Link>
      </div>
      <Suspense
        fallback={<div className="h-40 animate-pulse rounded-xl bg-muted" />}
      >
        <EventsTable />
      </Suspense>
    </div>
  )
}
