import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { listAdminEvents } from '@/data/admin-events'
import { eventTypes } from '@/event-types'
import { formatEventDate } from '@/lib/dates'
import { templates } from '@/templates/registry'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { STATUS_LABELS } from '../events/labels'

const STATUS_VARIANT = {
  archived: 'outline',
  draft: 'secondary',
  published: 'default',
} as const

/** Table of every event. Reads the session, so it renders per request. */
export async function EventsTable(): Promise<ReactNode> {
  const rows = await listAdminEvents()

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-background px-6 py-16 text-center">
        <p className="font-medium">Todavía no hay eventos</p>
        <p className="text-sm text-muted-foreground">
          Crea el primero para empezar a armar su invitación.
        </p>
        <Link className={buttonVariants()} href="/admin/events/new">
          Nuevo evento
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Evento</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Confirmados</TableHead>
            <TableHead className="pr-4 text-right">
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="pl-4">
                <Link
                  className="font-medium hover:underline"
                  href={`/admin/events/${event.id}`}
                >
                  {event.title}
                </Link>
                <div className="text-xs text-muted-foreground">
                  {[event.clientName, templates[event.templateKey]?.name]
                    .filter(Boolean)
                    .join(' · ')}
                </div>
              </TableCell>
              <TableCell>{eventTypes[event.type].label}</TableCell>
              <TableCell className="whitespace-nowrap">
                {formatEventDate(event.startsAt, event.timezone, {
                  dateStyle: 'medium',
                })}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[event.status]}>
                  {STATUS_LABELS[event.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {event.confirmed} / {event.guests}
              </TableCell>
              <TableCell className="pr-4 text-right whitespace-nowrap">
                {event.status === 'published' ? (
                  <a
                    className={buttonVariants({ size: 'sm', variant: 'ghost' })}
                    href={`/e/${event.slug}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Ver
                  </a>
                ) : null}
                <Link
                  className={buttonVariants({ size: 'sm', variant: 'outline' })}
                  href={`/admin/events/${event.id}`}
                >
                  Editar
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
