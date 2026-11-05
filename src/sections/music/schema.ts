import { z } from 'zod'

export const MusicSchema = z.object({
  /** MP3 file URL. */
  url: z.url(),
})

export type MusicData = z.infer<typeof MusicSchema>
