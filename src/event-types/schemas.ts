import { z } from 'zod'

const PersonName = z.object({
  fullName: z.string().min(1),
  shortName: z.string().min(1),
})

export const WeddingHosts = z.object({
  coupleDisplay: z.string().min(1),
  partner1: PersonName,
  partner2: PersonName,
})

export const HonoreeHosts = z.object({
  honoree: PersonName,
  honoreeGender: z.enum(['female', 'male']),
})

export const BirthdayHosts = HonoreeHosts.extend({
  age: z.number().int().positive().optional(),
})

export const GeneralHosts = z.object({
  eventName: z.string().min(1),
  hostDisplay: z.string().min(1),
})

export type WeddingHosts = z.infer<typeof WeddingHosts>
export type HonoreeHosts = z.infer<typeof HonoreeHosts>
export type BirthdayHosts = z.infer<typeof BirthdayHosts>
export type GeneralHosts = z.infer<typeof GeneralHosts>
