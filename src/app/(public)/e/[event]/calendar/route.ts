import { getPublishedEvent } from '@/data/invitations'
import { buildIcs } from '@/lib/calendar'
import { calendarEventOf } from '@/sections/calendar/calendar-event'
import type { CalendarData } from '@/sections/calendar/schema'
import type { NextRequest } from 'next/server'

/**
 * `GET /e/{event}/calendar`: the event as an `.ics` file. Only for
 * published events that show the "Agendar fecha" section.
 *
 * @param request - Incoming request.
 * @param context - Route context.
 * @param context.params - Route params (`event`).
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext<'/e/[event]/calendar'>
): Promise<Response> {
  const { event: slug } = await params
  const invitation = await getPublishedEvent(slug)
  const section = invitation?.sections.find(
    (item) => item.type === 'add_to_calendar'
  )
  if (!invitation || !section) return new Response('Not found', { status: 404 })

  const url = new URL(`/e/${slug}`, request.url).toString()
  const ics = buildIcs(
    calendarEventOf(invitation.event, section.data as CalendarData, url)
  )
  return new Response(ics, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Content-Disposition': `attachment; filename="${slug}.ics"`,
      'Content-Type': 'text/calendar; charset=utf-8',
    },
  })
}
