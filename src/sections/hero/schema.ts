import { z } from 'zod'

export const HeroSchema = z.object({
  /** Background photo for the `photo` variant. */
  imageUrl: z.url().optional(),
})

export type HeroData = z.infer<typeof HeroSchema>

export const HERO_VARIANTS = ['classic', 'photo'] as const
