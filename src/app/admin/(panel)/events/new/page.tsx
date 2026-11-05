import { createEvent } from '@/app/admin/events/actions'
import { EventFormView } from '@/app/admin/events/form/EventFormView'
import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { AdminOnly } from '../../AdminOnly'

export const metadata: Metadata = { title: 'Nuevo evento' }

/** `/admin/events/new`. */
export default function NewEventPage(): ReactNode {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo evento</h1>
        <p className="text-sm text-muted-foreground">
          Empieza con las secciones típicas de su tipo; las llenas después.
        </p>
      </div>
      <Suspense>
        <AdminOnly>
          <EventFormView action={createEvent} />
        </AdminOnly>
      </Suspense>
    </div>
  )
}
