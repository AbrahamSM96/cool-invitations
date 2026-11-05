/** Image formats accepted for uploads, by their real bytes. */
export type ImageType = { mime: string; extension: string }

/**
 * Reads bytes `from`..`to` as Latin-1 text, for comparing signatures.
 *
 * @param bytes - File start.
 * @param from - First byte.
 * @param to - Byte after the last.
 */
function textOf(bytes: Uint8Array, from: number, to: number): string {
  return String.fromCharCode(...bytes.subarray(from, to))
}

/**
 * Detects an image format from its first bytes ("magic numbers"), so a
 * renamed file cannot pass as an image. Returns `null` for anything else.
 *
 * @param bytes - Start of the file (16 bytes are enough).
 */
export function detectImageType(bytes: Uint8Array): ImageType | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { extension: 'jpg', mime: 'image/jpeg' }
  }
  if (textOf(bytes, 0, 8) === '\x89PNG\r\n\x1a\n') {
    return { extension: 'png', mime: 'image/png' }
  }
  if (textOf(bytes, 0, 4) === 'RIFF' && textOf(bytes, 8, 12) === 'WEBP') {
    return { extension: 'webp', mime: 'image/webp' }
  }
  if (textOf(bytes, 4, 12) === 'ftypavif') {
    return { extension: 'avif', mime: 'image/avif' }
  }
  return null
}
