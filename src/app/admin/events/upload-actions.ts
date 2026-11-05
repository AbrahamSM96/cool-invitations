'use server'

import { db } from '@/db'
import { events, media } from '@/db/schema'
import { requireAdmin } from '@/lib/auth/dal'
import { detectImageType } from '@/lib/image-type'
import { isStorageConfigured, putPublicObject } from '@/lib/storage'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { z } from 'zod'

/** Below `serverActions.bodySizeLimit` (4 MB) with room for form overhead. */
const MAX_BYTES = 3.5 * 1024 * 1024

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string }

const Dimension = z.coerce.number().int().positive().max(10_000).optional()

/**
 * Stores a photo for an event (already resized in the browser) and records
 * it in `media`. The format is checked from the bytes, not the file name.
 *
 * @param eventId - Event the photo belongs to.
 * @param formData - `file`, plus `width` and `height` in pixels.
 */
export async function uploadEventImage(
  eventId: string,
  formData: FormData
): Promise<UploadResult> {
  await requireAdmin()
  if (!isStorageConfigured()) {
    return {
      error: 'Falta configurar el almacenamiento de fotos (R2).',
      ok: false,
    }
  }

  const id = z.uuid().safeParse(eventId)
  if (!id.success) return { error: 'Este evento no existe.', ok: false }
  const [event] = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.id, id.data))
    .limit(1)
  if (!event) return { error: 'Este evento no existe.', ok: false }

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Elige una foto.', ok: false }
  }
  if (file.size > MAX_BYTES) {
    return { error: 'La foto pesa demasiado (máximo 3.5 MB).', ok: false }
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const type = detectImageType(bytes)
  if (!type) {
    return {
      error: 'El archivo no es una foto JPG, PNG, WebP o AVIF.',
      ok: false,
    }
  }

  const key = `events/${event.id}/${nanoid(16)}.${type.extension}`
  const url = await putPublicObject(key, bytes, type.mime)
  await db.insert(media).values({
    eventId: event.id,
    height: Dimension.catch(undefined).parse(formData.get('height')) ?? null,
    kind: 'image',
    url,
    width: Dimension.catch(undefined).parse(formData.get('width')) ?? null,
  })
  return { ok: true, url }
}
