import { isEventId } from '@/data/admin-events'
import { getAdminGuests } from '@/data/admin-guests'
import { guestPath } from '@/lib/guest-link'
import { formatPhone } from '@/lib/phone'
import { invitationMessage, whatsappLink } from '@/lib/whatsapp'
import type { NextRequest } from 'next/server'
import { type CellObject, utils, write } from 'xlsx'

const RSVP_TEXT = { no: 'no asiste', yes: 'confirmado' } as const

/**
 * `GET /admin/events/{id}/export`: Excel with every guest, their private
 * link, a ready-to-send WhatsApp link and their RSVP. A snapshot; the
 * client page shows the live state.
 *
 * @param request - Incoming request (its origin builds absolute links).
 * @param context - Route context.
 * @param context.params - Route params (`id`).
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext<'/admin/events/[id]/export'>
): Promise<Response> {
  const { id } = await params
  if (!isEventId(id)) return new Response('Not found', { status: 404 })
  // Checks the admin session too.
  const page = await getAdminGuests(id)
  if (!page) return new Response('Not found', { status: 404 })

  const origin = request.nextUrl.origin
  const header = [
    'nombre',
    'pases',
    'mesa',
    'grupo',
    'telefono',
    'link',
    'enviar_whatsapp',
    'rsvp',
    'pases_confirmados',
    'mensaje',
    'respondio',
  ]
  const rows = page.guests.map((guest) => {
    const link = `${origin}${guestPath(page.event.slug, guest)}`
    const whatsapp = guest.phone
      ? whatsappLink(
          guest.phone,
          invitationMessage(page.event, guest.displayName, link)
        )
      : ''
    return [
      guest.displayName,
      guest.maxPasses,
      guest.table ?? '',
      guest.group ?? '',
      guest.phone ? formatPhone(guest.phone) : '',
      link,
      whatsapp,
      guest.status === 'disabled'
        ? 'deshabilitado'
        : guest.rsvp
          ? RSVP_TEXT[guest.rsvp.response]
          : 'pendiente',
      guest.rsvp?.passes ?? '',
      guest.rsvp?.message ?? '',
      guest.rsvp?.respondedAt ?? '',
    ]
  })

  const sheet = utils.aoa_to_sheet([header, ...rows], { cellDates: true })
  // Clickable links in the "link" and "enviar_whatsapp" columns.
  rows.forEach((row, i) => {
    for (const column of [5, 6]) {
      const target = row[column]
      const cell = sheet[utils.encode_cell({ c: column, r: i + 1 })] as
        | CellObject
        | undefined
      if (cell && typeof target === 'string' && target) {
        cell.l = { Target: target }
        if (column === 6) cell.v = 'Enviar'
      }
    }
  })
  sheet['!cols'] = [
    { wch: 28 },
    { wch: 6 },
    { wch: 6 },
    { wch: 16 },
    { wch: 18 },
    { wch: 60 },
    { wch: 10 },
    { wch: 14 },
    { wch: 10 },
    { wch: 40 },
    { wch: 18 },
  ]

  const book = utils.book_new()
  utils.book_append_sheet(book, sheet, 'Invitados')
  const file = write(book, { bookType: 'xlsx', type: 'buffer' }) as Buffer

  return new Response(new Uint8Array(file), {
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Disposition': `attachment; filename="invitados-${page.event.slug}.xlsx"`,
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  })
}
