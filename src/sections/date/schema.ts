import { z } from 'zod'

export const DateSchema = z.object({
  title: z.string().min(1),
})

export type DateData = z.infer<typeof DateSchema>
