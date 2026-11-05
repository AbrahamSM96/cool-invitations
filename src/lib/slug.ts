/** Lowercase words joined by single dashes, e.g. `viridiana-y-daniel`. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Suggests a URL slug from a name: drops accents and symbols, "&" becomes "y".
 *
 * @param text - Name, e.g. "Viridiana & Daniel".
 */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replaceAll(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replaceAll('&', ' y ')
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '')
}
