import { z } from 'zod'

import { imageField } from '../shared'

export const HERO_VARIANTS = ['classic', 'photo'] as const

export const HeroSchema = z.object({
  /** Background photo for the `photo` variant. */
  imageUrl: imageField({
    aspect: '9:16',
    label: 'Foto de portada',
    variants: ['photo'],
  }).optional(),
})

export type HeroData = z.infer<typeof HeroSchema>
