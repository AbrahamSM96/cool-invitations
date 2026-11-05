import { z } from 'zod'

/** Background band of a section. */
export const Tone = z.enum(['base', 'soft', 'strong'])
export type Tone = z.infer<typeof Tone>
