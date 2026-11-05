'use client'

import { RsvpBadge } from '@/components/admin/RsvpBadge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ClientGuest } from '@/data/client-page'
import { slugify } from '@/lib/slug'
import { CopyIcon, MessageCircleIcon } from 'lucide-react'
import { type ReactNode, useDeferredValue, useState } from 'react'
import { toast } from 'sonner'

type Guest = ClientGuest & { link: string; whatsapp: string | null }

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
function matchesFilter(guest: Guest, filter: Filter): boolean {
  if (filter === 'all') return true
  if (filter === 'pending') return !guest.rsvp && guest.status === 'enabled'
  return guest.rsvp?.response === filter
}

/**
 * Client's guest list as cards (phone first): RSVP state, WhatsApp button
 * with the message ready, and copy link.
 *
 * @param props - Component props.
 * @param props.guests - Guests with their links.
 */
export function ClientGuestList({ guests }: { guests: Guest[] }): ReactNode {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const needle = slugify(useDeferredValue(query))
  const visible = guests.filter(
    (guest) =>
      matchesFilter(guest, filter) &&
      (!needle ||
        slugify(`${guest.displayName} ${guest.table ?? ''}`).includes(needle))
  )

  /**
   * Copies a guest's link.
   *
   * @param guest - Guest whose link to copy.
   */
  async function copy(guest: Guest): Promise<void> {
    try {
      await navigator.clipboard.writeText(guest.link)
      toast.success(`Link de ${guest.displayName} copiado`)
    } catch {
      toast.error('No se pudo copiar.')
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <Input
        aria-label="Buscar invitado"
        onChange={(event) => setQuery(event.currentTarget.value)}
        placeholder="Buscar por nombre o mesa"
        type="search"
        value={query}
      />
      <fieldset className="flex flex-wrap gap-1">
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

      <ul className="flex flex-col gap-2">
        {visible.map((guest) => (
          <li
            className="flex flex-col gap-3 rounded-xl border bg-background p-4"
            key={guest.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{guest.displayName}</p>
                <p className="text-sm text-muted-foreground">
                  {guest.maxPasses} {guest.maxPasses === 1 ? 'pase' : 'pases'}
                  {guest.table ? ` · Mesa ${guest.table}` : ''}
                </p>
              </div>
              <RsvpBadge
                disabled={guest.status === 'disabled'}
                rsvp={guest.rsvp}
              />
            </div>
            {guest.rsvp?.message ? (
              <p className="rounded-lg bg-muted px-3 py-2 text-sm">
                “{guest.rsvp.message}”
              </p>
            ) : null}
            {guest.status === 'enabled' ? (
              <div className="flex gap-2">
                {guest.whatsapp ? (
                  <a
                    className={buttonVariants({
                      className:
                        'flex-1 bg-[#25D366] text-white hover:bg-[#1ebe5b]',
                    })}
                    href={guest.whatsapp}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <MessageCircleIcon /> Enviar por WhatsApp
                  </a>
                ) : null}
                <Button
                  className={guest.whatsapp ? undefined : 'flex-1'}
                  onClick={() => void copy(guest)}
                  type="button"
                  variant="outline"
                >
                  <CopyIcon /> Copiar link
                </Button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No hay invitados con ese filtro.
        </p>
      ) : null}
    </section>
  )
}
