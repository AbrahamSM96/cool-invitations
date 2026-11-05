/** Longest side of uploaded photos; enough for a phone-sized invitation. */
const MAX_SIDE = 2000
const QUALITY = 0.85

export interface ResizedImage {
  file: File
  width: number
  height: number
}

/**
 * Shrinks a photo in the browser before uploading: at most 2000 px per side,
 * re-encoded as WebP. A phone photo of ~8 MB ends up around 300 KB.
 * Throws when the browser cannot read the format (e.g. HEIC on Chrome).
 *
 * @param file - File picked by the admin.
 */
export async function resizeImage(file: File): Promise<ResizedImage> {
  // `from-image` applies the EXIF rotation, so phone photos stay upright.
  const bitmap = await createImageBitmap(file, {
    imageOrientation: 'from-image',
  })
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D is not available')
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', QUALITY)
  )
  if (!blob) throw new Error('Could not encode the image')

  // Browsers without WebP encoding fall back to PNG; keep the real type.
  const extension = blob.type === 'image/webp' ? 'webp' : 'png'
  const name = file.name.replace(/\.[^.]+$/, '') || 'foto'
  return {
    file: new File([blob], `${name}.${extension}`, { type: blob.type }),
    height,
    width,
  }
}
