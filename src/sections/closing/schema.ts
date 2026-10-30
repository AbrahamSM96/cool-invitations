import { z } from 'zod'

export const ClosingSchema = z.object({
  message: z.string().min(1),
  /** e.g. "con amor, Viridiana & Daniel". */
  signature: z.string().min(1),
})

export type ClosingData = z.infer<typeof ClosingSchema>
