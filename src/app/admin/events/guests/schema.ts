import { guestStatus } from '@/db/schema'
import { normalizePhone } from '@/lib/phone'
import '@/lib/zod-es'
import { z } from 'zod'

/**
 *
 */
/** Trimmed text; empty → `null`. Length is checked per field below. */
const optionalText = z
  .string()
  .trim()
  .transform((value) => value || null)

/** Empty input → `null`; otherwise a whole number in range. */
const optionalCount = z.preprocess(
  (value) => (value === '' || value === undefined ? null : value),
  z.coerce.number().int().min(0).max(50).nullable()
)

/** A guest (pass) as edited in the CMS or read from an imported row. */
export const GuestForm = z
  .object({
    adults: optionalCount,
    displayName: z
      .string()
      .trim()
      .min(1, 'Escribe el nombre como aparecerá en la invitación.')
      .max(120),
    group: optionalText.refine(
      (v) => !v || v.length <= 60,
      'Máximo 60 caracteres.'
    ),
    kids: optionalCount,
    maxPasses: z.coerce
      .number()
      .int('Debe ser un número entero.')
      .min(1, 'Mínimo 1 pase.')
      .max(50, 'Máximo 50 pases.'),
    notes: optionalText.refine(
      (v) => !v || v.length <= 500,
      'Máximo 500 caracteres.'
    ),
    personalMessage: optionalText.refine(
      (v) => !v || v.length <= 500,
      'Máximo 500 caracteres.'
    ),
    phone: z
      .string()
      .trim()
      .transform((value, context) => {
        if (!value) return null
        const phone = normalizePhone(value)
        if (!phone) {
          context.addIssue({ code: 'custom', message: 'Teléfono inválido.' })
          return z.NEVER
        }
        return phone
      }),
    status: z.enum(guestStatus.enumValues),
    table: optionalText.refine(
      (v) => !v || v.length <= 20,
      'Máximo 20 caracteres.'
    ),
  })
  .refine(
    (guest) =>
      guest.adults === null ||
      guest.kids === null ||
      guest.adults + guest.kids <= guest.maxPasses,
    { message: 'Adultos + niños no puede pasar de los pases.', path: ['kids'] }
  )

export type GuestFormInput = z.input<typeof GuestForm>
export type GuestFormData = z.output<typeof GuestForm>

export type GuestActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

export type ImportResult =
  | {
      ok: true
      created: number
      /** Names already in the list (when skipping duplicates). */
      skipped: number
      /** Rows not imported, by spreadsheet line. */
      errors: { line: number; message: string }[]
    }
  | { ok: false; error: string }
