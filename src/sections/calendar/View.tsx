import { SectionFrame } from '@/components/invitation/SectionFrame'
import { SectionHeading } from '@/components/invitation/SectionHeading'
import { googleCalendarUrl } from '@/lib/calendar'
import type { ReactNode } from 'react'

import type { SectionProps } from '../types'

import { calendarEventOf } from './calendar-event'
import type { CalendarData } from './schema'

const BUTTON =
  'w-full max-w-64 border border-inv-primary px-6 py-3 font-caps text-[11px] tracking-[0.25em] uppercase'

/**
 * "Add to calendar" buttons: Google Calendar, and an `.ics` file that
 * Apple Calendar and Outlook open directly.
 *
 * @param props - Section props.
 * @param props.data - Section content.
 * @param props.event - Event shown in the invitation.
 */
export function CalendarView({
  data,
  event,
}: SectionProps<CalendarData>): ReactNode {
  return (
    <SectionFrame tone={data.tone}>
      <SectionHeading eyebrow={data.eyebrow} title={data.title} />
      {data.text ? (
        <p className="max-w-72 text-sm leading-relaxed text-inv-muted">
          {data.text}
        </p>
      ) : null}
      <div className="mt-2 flex w-full flex-col items-center gap-3">
        <a
          className={`${BUTTON} bg-inv-primary text-inv-on-primary`}
          href={googleCalendarUrl(calendarEventOf(event, data))}
          rel="noreferrer"
          target="_blank"
        >
          Google Calendar
        </a>
        <a
          className={BUTTON}
          download={`${event.slug}.ics`}
          href={`/e/${event.slug}/calendar`}
        >
          iPhone / Outlook
        </a>
      </div>
    </SectionFrame>
  )
}
