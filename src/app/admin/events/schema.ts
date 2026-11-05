import { eventStatus } from '@/db/schema'
import {
  BirthdayHosts,
  GeneralHosts,
  HonoreeHosts,
  WeddingHosts,
} from '@/event-types/schemas'
import { isValidTimeZone } from '@/lib/dates'
import '@/lib/zod-es'
import { SLUG_PATTERN } from '@/lib/slug'
import { templates } from '@/templates/registry'
import { z } from 'zod'

/** Value of `<input type="datetime-local">`, in the event's time zone. */
const LocalDateTime = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Elige fecha y hora.')

const optionalText = z
  .string()
  .trim()
  .max(120)
  .transform((value) => value || null)

const EventBase = z.object({
  cityLabel: optionalText,
  clientName: optionalText,
  rsvpDeadline: LocalDateTime.or(z.literal('')).transform(
    (value) => value || null
  ),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(60, 'Máximo 60 caracteres.')
    .regex(SLUG_PATTERN, 'Solo minúsculas, números y guiones.'),
  startsAt: LocalDateTime,
  status: z.enum(eventStatus.enumValues),
  templateKey: z
    .string()
    .refine((key) => Object.hasOwn(templates, key), 'Elige un diseño.'),
  timezone: z.string().refine(isValidTimeZone, 'Zona horaria inválida.'),
  title: z.string().trim().min(1, 'Escribe un nombre.').max(120),
  voice: z.enum(['singular', 'plural']),
})

/**
 * Base data of an event, as edited in the CMS. `hosts` follows the event
 * type; dates are wall-clock values in `timezone`.
 */
export const EventForm = z
  .discriminatedUnion('type', [
    EventBase.extend({ hosts: WeddingHosts, type: z.literal('wedding') }),
    EventBase.extend({ hosts: HonoreeHosts, type: z.literal('xv') }),
    EventBase.extend({ hosts: BirthdayHosts, type: z.literal('birthday') }),
    EventBase.extend({ hosts: GeneralHosts, type: z.literal('general') }),
  ])
  .refine(
    // Same fixed-width format, so comparing strings compares dates.
    (event) => !event.rsvpDeadline || event.rsvpDeadline <= event.startsAt,
    {
      message: 'Debe ser antes del evento.',
      path: ['rsvpDeadline'],
    }
  )

export type EventFormInput = z.input<typeof EventForm>
export type EventFormData = z.output<typeof EventForm>

export interface EventActionError {
  ok: false
  error: string
  /** Messages by field path, e.g. `hosts.partner1.fullName`. */
  fieldErrors?: Record<string, string>
}

export type EventActionResult = { ok: true; id: string } | EventActionError
