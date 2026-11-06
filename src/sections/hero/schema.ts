import { z } from 'zod'

import { imageField } from '../shared'

export const HERO_VARIANTS = ['classic', 'photo', 'art'] as const

export const HeroSchema = z
  .object({
    /** Text read aloud instead of the `art` picture. */
    artAlt: z
      .string()
      .optional()
      .meta({
        description:
          'Lo que dice la imagen, para lectores de pantalla. Ej. "Celebra los XV de Ava".',
        title: 'Texto de la imagen',
        variants: ['art'],
      }),
    /** Whole cover designed elsewhere (Canva...), for the `art` variant. */
    artUrl: imageField({
      aspect: '9:16',
      label: 'Arte de portada',
      variants: ['art'],
    })
      .optional()
      .meta({
        description:
          'Diseño completo, vertical 9:16 (1080 × 1920). Se muestra tal cual.',
        title: 'Arte de portada',
      }),
    /** Background photo for the `photo` variant. */
    imageUrl: imageField({
      aspect: '9:16',
      label: 'Foto de portada',
      variants: ['photo'],
    }).optional(),
  })
  .meta({ fieldOrder: ['imageUrl', 'artUrl', 'artAlt'] })

export type HeroData = z.infer<typeof HeroSchema>
