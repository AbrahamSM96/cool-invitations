import { z } from 'zod'

import { Tone } from '../shared'

export const RsvpSchema = z
  .object({
    /** Ask guests for an optional message. */
    askMessage: z.boolean().meta({ title: 'Pedir un mensaje opcional' }),
    /** Shown after answering "no". */
    declinedText: z
      .string()
      .min(1)
      .meta({ title: 'Texto si no asiste', widget: 'textarea' }),
    /** Shown on the generic invitation, where nobody can answer. */
    genericText: z.string().min(1).meta({
      description: 'En la invitación sin nombre, donde nadie puede confirmar.',
      title: 'Texto en la invitación general',
      widget: 'textarea',
    }),
    /** Optional line under the title. */
    text: z.string().optional().meta({ title: 'Texto bajo el título' }),
    /** Shown after answering "yes". */
    thanksText: z
      .string()
      .min(1)
      .meta({ title: 'Texto si confirma', widget: 'textarea' }),
    title: z.string().min(1).meta({ title: 'Título' }),
    tone: Tone.default('soft'),
  })
  .meta({
    fieldOrder: [
      'title',
      'text',
      'askMessage',
      'thanksText',
      'declinedText',
      'genericText',
      'tone',
    ],
  })

export type RsvpData = z.infer<typeof RsvpSchema>

export const MESSAGE_MAX_LENGTH = 500

/** What a guest submits from the form. */
export const RsvpSubmission = z.object({
  message: z
    .string()
    .trim()
    .max(MESSAGE_MAX_LENGTH)
    .transform((value) => value || null),
  passes: z.coerce.number().int().min(0),
  response: z.enum(['yes', 'no']),
})

export interface RsvpAnswer {
  response: 'yes' | 'no'
  passes: number
  message: string | null
}

export type RsvpFormState =
  | { status: 'idle' }
  | { status: 'saved'; answer: RsvpAnswer }
  | { status: 'error'; error: string }
