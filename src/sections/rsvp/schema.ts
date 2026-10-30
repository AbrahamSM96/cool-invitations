import { z } from 'zod'

export const RsvpSchema = z.object({
  /** Ask guests for an optional message. */
  askMessage: z.boolean(),
  /** Shown after answering "no". */
  declinedText: z.string().min(1),
  /** Shown on the generic invitation, where nobody can answer. */
  genericText: z.string().min(1),
  /** Shown after answering "yes". */
  thanksText: z.string().min(1),
  title: z.string().min(1),
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
