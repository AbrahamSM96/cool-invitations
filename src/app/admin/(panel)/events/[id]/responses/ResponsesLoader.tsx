import { PrintButton } from '@/components/admin/PrintButton'
import { RsvpBadge } from '@/components/admin/RsvpBadge'
import { RsvpTotalsBar } from '@/components/admin/RsvpTotalsBar'
import { buttonVariants } from '@/components/ui/button'
import { isEventId } from '@/data/admin-events'
import { type AdminGuest, getAdminGuests } from '@/data/admin-guests'
import { rsvpTotals } from '@/lib/rsvp-totals'
import { DownloadIcon } from 'lucide-react'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

const NO_TABLE = 'Sin mesa'

/**
 * Confirmed passes per table, tables in natural order ("2" before "10").
 *
 * @param guests - Guests with their RSVP.
 */
function byTable(
  guests: AdminGuest[]
): { table: string; passes: number; confirmed: number }[] {
  const tables = new Map<string, { passes: number; confirmed: number }>()
  for (const guest of guests) {
    if (guest.status === 'disabled') continue
    const key = guest.table ?? NO_TABLE
    const row = tables.get(key) ?? { confirmed: 0, passes: 0 }
    row.passes += guest.maxPasses
    if (guest.rsvp?.response === 'yes') row.confirmed += guest.rsvp.passes
    tables.set(key, row)
  }
  return [...tables]
    .map(([table, row]) => ({ table, ...row }))
    .toSorted((a, b) =>
      a.table === NO_TABLE
        ? 1
        : b.table === NO_TABLE
          ? -1
          : a.table.localeCompare(b.table, 'es', { numeric: true })
    )
}

/**
 * Loads guests and renders the RSVP dashboard.
 *
 * @param props - Component props.
 * @param props.params - Route params (`id`).
 */
export async function ResponsesLoader({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<ReactNode> {
  const { id } = await params
  if (!isEventId(id)) notFound()
  const page = await getAdminGuests(id)
  if (!page) notFound()

  const tables = byTable(page.guests)
  const messages = page.guests
    .filter((guest) => guest.rsvp?.message)
    .toSorted(
      (a, b) =>
        (b.rsvp?.respondedAt.getTime() ?? 0) -
        (a.rsvp?.respondedAt.getTime() ?? 0)
    )
  const dateFormat = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 print:hidden">
        <div className="flex justify-end">
          <a
            className={buttonVariants({ variant: 'outline' })}
            href={`/admin/events/${id}/export`}
          >
            <DownloadIcon /> Descargar Excel
          </a>
        </div>
        <RsvpTotalsBar totals={rsvpTotals(page.guests)} />
      </div>

      {tables.length > 0 ? (
        <section className="flex flex-col gap-3 print:hidden">
          <h2 className="text-lg font-semibold">Por mesa</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {tables.map((row) => (
              <div
                className="rounded-lg border bg-background p-3"
                key={row.table}
              >
                <div className="text-xs text-muted-foreground">
                  {row.table === NO_TABLE ? row.table : `Mesa ${row.table}`}
                </div>
                <div className="text-lg font-semibold tabular-nums">
                  {row.confirmed}
                  <span className="text-sm font-normal text-muted-foreground">
                    {' '}
                    / {row.passes}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Pases confirmados / pases enviados.
          </p>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">
            Mensajes para {page.event.hostsName}
          </h2>
          {messages.length > 0 ? (
            <PrintButton label="Imprimir mensajes" />
          ) : null}
        </div>
        {messages.length === 0 ? (
          <p className="rounded-xl border border-dashed bg-background px-6 py-10 text-center text-sm text-muted-foreground">
            Todavía nadie ha dejado un mensaje.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 print:block">
            {messages.map((guest) => (
              <li
                className="flex break-inside-avoid flex-col gap-2 rounded-xl border bg-background p-4 print:mb-4 print:border-0 print:p-0"
                key={guest.id}
              >
                <p className="whitespace-pre-line">“{guest.rsvp?.message}”</p>
                <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    — {guest.displayName}
                  </span>
                  <span className="flex items-center gap-2 print:hidden">
                    {guest.rsvp
                      ? dateFormat.format(guest.rsvp.respondedAt)
                      : null}
                    <RsvpBadge rsvp={guest.rsvp} />
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
