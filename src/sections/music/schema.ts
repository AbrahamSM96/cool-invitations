import { z } from 'zod'

export const MusicSchema = z.object({
  /** MP3 file URL. */
  url: z.url().meta({ title: 'Link del archivo MP3' }),
})

export type MusicData = z.infer<typeof MusicSchema>
