'use client'

import { RsvpBadge } from '@/components/admin/RsvpBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { AdminGuest } from '@/data/admin-guests'
import { guestPath } from '@/lib/guest-link'
import { formatPhone } from '@/lib/phone'
import { slugify } from '@/lib/slug'
import {
  FileSpreadsheetIcon,
  LinkIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { type ReactNode, useDeferredValue, useState } from 'react'
import { toast } from 'sonner'

import { deleteGuest } from './actions'
import { GuestFormPanel } from './GuestFormPanel'

// SheetJS is large: load the importer only when it is opened.
const ImportPanel = dynamic(async () => {
  const loaded = await import('./import/ImportPanel')
  return loaded.ImportPanel
})

const FILTERS = {
  all: 'Todos',
  no: 'No asisten',
  pending: 'Pendientes',
  yes: 'Confirmaron',
} as const

type Filter = keyof typeof FILTERS

/**
 * Tells whether a guest matches the RSVP filter.
 *
 * @param guest - Guest to check.
 * @param filter - Selected filter.
 */
function matchesFilter(guest: AdminGuest, filter: Filter): boolean {
  if (filter === 'all') return true
  if (filter === 'pending') return !guest.rsvp && guest.status === 'enabled'
  return guest.rsvp?.response === filter
}

interface GuestsManagerProps {
  eventId: string
  eventSlug: string
  published: boolean
  guests: AdminGuest[]
}

/**
 * Guest list of an event: search, add, edit, delete and copy each private
 * link.
 *
 * @param props - Component props.
 * @param props.eventId - Event id.
 * @param props.eventSlug - Event slug, for the links.
 * @param props.guests - Guests with their RSVP.
 * @param props.published - Links only work once the event is published.
 */
export function GuestsManager({
  eventId,
  eventSlug,
  guests,
  published,
}: GuestsManagerProps): ReactNode {
  const router = useRouter()
  // `null`: closed; `'new'`: adding; an id: editing that guest.
  const [editing, setEditing] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const deferredQuery = useDeferredValue(query)

  const needle = slugify(deferredQuery)
  const visible = guests.filter(
    (guest) =>
      matchesFilter(guest, filter) &&
      (!needle ||
        slugify(
          [guest.displayName, guest.group, guest.table]
            .filter(Boolean)
            .join(' ')
        ).includes(needle))
  )
  const groups = [
    ...new Set(guests.flatMap((guest) => (guest.group ? [guest.group] : []))),
  ].toSorted((a, b) => a.localeCompare(b, 'es'))
  const editedGuest = guests.find((guest) => guest.id === editing)

  /**
   * Copies a guest's private invitation link.
   *
   * @param guest - Guest whose link to copy.
   */
  async function copyLink(guest: AdminGuest): Promise<void> {
    const path = guestPath(eventSlug, guest)
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`)
      toast.success(`Link de ${guest.displayName} copiado`)
    } catch {
      toast.error('No se pudo copiar.')
    }
  }

  /**
   * Deletes a guest after the second click.
   *
   * @param guest - Guest to delete.
   */
  async function remove(guest: AdminGuest): Promise<void> {
    const result = await deleteGuest(guest.id)
    setConfirmDelete(null)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success(`${guest.displayName} borrado`)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4">
      {!published ? (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
          El evento está en borrador: los links de los invitados funcionarán
          cuando lo publiques.
        </p>
      ) : null}

      {importing ? (
        <ImportPanel eventId={eventId} onClose={() => setImporting(false)} />
      ) : null}

      {editing === 'new' || editedGuest ? (
        <GuestFormPanel
          eventId={eventId}
          groups={groups}
          guest={editedGuest}
          key={editing}
          onDone={() => setEditing(null)}
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Input
          aria-label="Buscar invitado"
          className="max-w-xs"
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Buscar por nombre, grupo o mesa"
          type="search"
          value={query}
        />
        <fieldset className="flex gap-1">
          <legend className="sr-only">Filtrar por respuesta</legend>
          {(Object.keys(FILTERS) as Filter[]).map((key) => (
            <Button
              aria-pressed={filter === key}
              key={key}
              onClick={() => setFilter(key)}
              size="sm"
              type="button"
              variant={filter === key ? 'secondary' : 'ghost'}
            >
              {FILTERS[key]}
            </Button>
          ))}
        </fieldset>
        <span className="text-sm text-muted-foreground">
          {visible.length} de {guests.length}
        </span>
        <Button
          className="ml-auto"
          onClick={() => {
            setEditing(null)
            setImporting(true)
          }}
          type="button"
          variant="outline"
        >
          <FileSpreadsheetIcon /> Importar de Excel
        </Button>
        <Button
          onClick={() => {
            setImporting(false)
            setEditing('new')
          }}
          type="button"
        >
          <PlusIcon /> Agregar invitado
        </Button>
      </div>

      {guests.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-background px-6 py-16 text-center text-sm text-muted-foreground">
          Todavía no hay invitados. Agrégalos uno por uno o impórtalos de Excel.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Invitado</TableHead>
                <TableHead className="text-right">Pases</TableHead>
                <TableHead>Mesa</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Respuesta</TableHead>
                <TableHead className="pr-4 text-right">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell className="pl-4">
                    <div className="font-medium">{guest.displayName}</div>
                    {guest.group ? (
                      <div className="text-xs text-muted-foreground">
                        {guest.group}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {guest.maxPasses}
                  </TableCell>
                  <TableCell>{guest.table ?? '—'}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {guest.phone ? formatPhone(guest.phone) : '—'}
                  </TableCell>
                  <TableCell>
                    <RsvpBadge
                      disabled={guest.status === 'disabled'}
                      rsvp={guest.rsvp}
                    />
                  </TableCell>
                  <TableCell className="pr-4 text-right whitespace-nowrap">
                    {confirmDelete === guest.id ? (
                      <span className="inline-flex items-center gap-1 text-sm">
                        ¿Borrar?
                        <Button
                          onClick={() => void remove(guest)}
                          size="xs"
                          type="button"
                          variant="destructive"
                        >
                          Sí
                        </Button>
                        <Button
                          onClick={() => setConfirmDelete(null)}
                          size="xs"
                          type="button"
                          variant="ghost"
                        >
                          No
                        </Button>
                      </span>
                    ) : (
                      <>
                        <Button
                          aria-label={`Copiar link de ${guest.displayName}`}
                          onClick={() => void copyLink(guest)}
                          size="icon-sm"
                          title="Copiar link"
                          type="button"
                          variant="ghost"
                        >
                          <LinkIcon />
                        </Button>
                        <Button
                          aria-label={`Editar ${guest.displayName}`}
                          onClick={() => setEditing(guest.id)}
                          size="icon-sm"
                          title="Editar"
                          type="button"
                          variant="ghost"
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          aria-label={`Borrar ${guest.displayName}`}
                          onClick={() => setConfirmDelete(guest.id)}
                          size="icon-sm"
                          title="Borrar"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2Icon />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
