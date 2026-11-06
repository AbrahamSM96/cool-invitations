'use client'

import { resizeImage } from '@/lib/resize-image'
import { toast } from 'sonner'

import { uploadEventImage } from '../upload-actions'

import { useEditorEventId } from './EditorContext'

/**
 * Like {@link useImageUploadFor}, for fields inside the sections editor.
 */
export function useImageUpload(): (file: File) => Promise<string | null> {
  return useImageUploadFor(useEditorEventId())
}

/**
 * Returns a function that shrinks a photo in the browser, uploads it to the
 * event and resolves to its public URL (or `null`, after telling the admin
 * what went wrong). Transparent PNGs keep their transparency (WebP).
 *
 * @param eventId - Event the photo belongs to.
 */
export function useImageUploadFor(
  eventId: string
): (file: File) => Promise<string | null> {
  return async function upload(file: File): Promise<string | null> {
    if (!file.type.startsWith('image/')) {
      toast.error(`${file.name}: no es una foto.`)
      return null
    }
    try {
      const resized = await resizeImage(file).catch(() => null)
      if (!resized) {
        toast.error(`${file.name}: no se pudo leer. Usa JPG o PNG.`)
        return null
      }
      const data = new FormData()
      data.set('file', resized.file)
      data.set('width', String(resized.width))
      data.set('height', String(resized.height))
      const result = await uploadEventImage(eventId, data)
      if (!result.ok) {
        toast.error(result.error)
        return null
      }
      return result.url
    } catch {
      toast.error('No se pudo subir la foto. Inténtalo de nuevo.')
      return null
    }
  }
}
