/**
 * WCAG relative luminance of a `#RRGGBB` color (0 = black, 1 = white).
 *
 * @param hex - Color, e.g. `#B89A5C`.
 */
export function luminance(hex: string): number {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((i) => {
    const channel = Number.parseInt(hex.slice(i, i + 2), 16) / 255
    return channel <= 0.039_28
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * WCAG contrast ratio between two colors, from 1 (same) to 21.
 *
 * @param a - First color.
 * @param b - Second color.
 */
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].toSorted((x, y) => y - x)
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05)
}

/** Minimum ratio for normal-size text (WCAG AA). */
export const MIN_TEXT_CONTRAST = 4.5
