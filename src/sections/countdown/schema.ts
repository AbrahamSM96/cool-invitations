import { z } from 'zod'

export const CountdownSchema = z.object({
  /** Shown once the event has started. */
  afterText: z.string().min(1),
  title: z.string().min(1),
})

export type CountdownData = z.infer<typeof CountdownSchema>
