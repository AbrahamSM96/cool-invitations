import { z } from 'zod'

import { Tone } from '../shared'

export const CalendarSchema = z
  .object({
    /** Event length, for the calendar entry's end time. */
    durationHours: z.coerce.number().int().min(1).max(24).default(6).meta({
      description: 'Para la hora de fin en el calendario.',
      title: 'Duración (horas)',
    }),
    eyebrow: z.string().optional().meta({ title: 'Texto pequeño superior' }),
    location: z.string().optional().meta({
      description: 'Si lo dejas vacío, se usa el primer lugar del evento.',
      title: 'Lugar',
    }),
    text: z.string().optional().meta({ title: 'Texto', widget: 'textarea' }),
    title: z.string().default('Agenda la fecha').meta({ title: 'Título' }),
    tone: Tone.default('base'),
  })
  .meta({
    fieldOrder: [
      'eyebrow',
      'title',
      'text',
      'location',
      'durationHours',
      'tone',
    ],
  })

export type CalendarData = z.infer<typeof CalendarSchema>
