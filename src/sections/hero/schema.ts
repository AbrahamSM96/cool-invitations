import { z } from 'zod'

export const HeroSchema = z.object({
  /** Optional background photo or artwork. */
  imageUrl: z.url().optional(),
})

export type HeroData = z.infer<typeof HeroSchema>
