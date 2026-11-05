import { z } from 'zod'

import { Tone } from '../shared'

export const GiftsSchema = z.object({
  /** Bank accounts or cards; each value gets a copy button. */
  accounts: z
    .array(
      z.object({
        bank: z.string().min(1),
        holder: z.string().optional(),
        number: z.string().min(1),
      })
    )
    .default([]),
  eyebrow: z.string().optional(),
  /** Gift registries and payment links (Liverpool, Amazon, PayPal...). */
  links: z
    .array(z.object({ label: z.string().min(1), url: z.url() }))
    .default([]),
  text: z.string().optional(),
  title: z.string().optional(),
  tone: Tone.default('base'),
})

export type GiftsData = z.infer<typeof GiftsSchema>
