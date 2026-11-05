import { z } from 'zod'

export const EnvelopeSchema = z.object({
  /** Hint under the envelope, e.g. "Toca el sobre para abrir". */
  hint: z.string().min(1),
})

export type EnvelopeData = z.infer<typeof EnvelopeSchema>
