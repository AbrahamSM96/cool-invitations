import { contrastRatio } from './contrast'

/**
 * Random color palettes that look good together and always stay readable.
 * Colors are picked in OKLCH (lightness, chroma, hue), where lightness
 * matches what the eye sees, then checked with WCAG contrast.
 */

export interface Oklch {
  l: number
  c: number
  h: number
}

/**
 * sRGB channel from linear light, gamma-encoded, or `null` out of gamut.
 *
 * @param value - Linear channel.
 */
function encode(value: number): number | null {
  if (value < -0.0005 || value > 1.0005) return null
  const v = Math.min(1, Math.max(0, value))
  return v <= 0.003_130_8 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055
}

/**
 * OKLCH → `#RRGGBB`, or `null` when the color does not exist on screens.
 *
 * @param color - OKLCH color.
 */
function toHexExact(color: Oklch): string | null {
  const { c, h, l } = color
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const lp = (l + 0.396_337_777_4 * a + 0.215_803_757_3 * b) ** 3
  const mp = (l - 0.105_561_345_8 * a - 0.063_854_172_8 * b) ** 3
  const sp = (l - 0.089_484_177_5 * a - 1.291_485_548 * b) ** 3
  const rgb = [
    4.076_741_662_1 * lp - 3.307_711_591_3 * mp + 0.230_969_929_2 * sp,
    -1.268_438_004_6 * lp + 2.609_757_401_1 * mp - 0.341_319_396_5 * sp,
    -0.004_196_086_3 * lp - 0.703_418_614_7 * mp + 1.707_614_701 * sp,
  ].map(encode)
  if (rgb.some((channel) => channel === null)) return null
  return `#${rgb
    .map((channel) =>
      Math.round((channel ?? 0) * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')
    .toUpperCase()}`
}

/**
 * OKLCH → `#RRGGBB`, lowering chroma until the color fits on screens.
 *
 * @param color - OKLCH color.
 */
export function oklchToHex(color: Oklch): string {
  for (let c = color.c; c >= 0; c -= 0.005) {
    const hex = toHexExact({ ...color, c })
    if (hex) return hex
  }
  return toHexExact({ ...color, c: 0 }) ?? '#808080'
}

/** How the accent and button hues relate to the main hue. */
const SCHEMES = {
  analogous: [30, -30],
  complementary: [180, 180],
  monochrome: [0, 0],
  split: [150, 210],
  triadic: [120, 240],
} as const

export type PaletteScheme = keyof typeof SCHEMES

export interface Palette {
  bg: string
  surface: string
  strong: string
  onStrong: string
  ink: string
  muted: string
  accent: string
  primary: string
  onPrimary: string
}

/** Text color → background, and the contrast it needs (WCAG AA). */
export const READABILITY_RULES: [keyof Palette, keyof Palette, number][] = [
  ['ink', 'bg', 4.5],
  ['ink', 'surface', 4.5],
  ['muted', 'bg', 4.5],
  ['accent', 'bg', 4.5],
  // Accent only sits on the intense band as large text (dates, names).
  ['accent', 'strong', 3],
  ['onStrong', 'strong', 4.5],
  ['onPrimary', 'primary', 4.5],
]

/**
 * Tells whether every text color of a palette reads well on its backgrounds.
 *
 * @param palette - Palette to check.
 */
export function isReadable(palette: Palette): boolean {
  return READABILITY_RULES.every(
    ([text, background, min]) =>
      contrastRatio(palette[text], palette[background]) >= min
  )
}

/**
 * Darkens a color step by step until it contrasts enough with `against`.
 *
 * @param color - Color to adjust.
 * @param against - Background it must read on.
 * @param min - Required ratio.
 */
function darkenUntil(color: Oklch, against: string, min: number): Oklch {
  let current = color
  while (
    current.l > 0.05 &&
    contrastRatio(oklchToHex(current), against) < min
  ) {
    current = { ...current, l: current.l - 0.01 }
  }
  return current
}

/**
 * Random number in `[min, max)`.
 *
 * @param random - Source of randomness in `[0, 1)`.
 * @param min - Lower bound.
 * @param max - Upper bound.
 */
function between(random: () => number, min: number, max: number): number {
  return min + random() * (max - min)
}

/**
 * Builds a light, readable palette: paper-like background tinted with the
 * main hue, dark text, buttons and accent from a color scheme (analogous,
 * complementary...). Retries until every contrast rule passes.
 *
 * @param random - Source of randomness, `Math.random` by default.
 */
export function randomPalette(random: () => number = Math.random): Palette {
  const schemes = Object.keys(SCHEMES) as PaletteScheme[]
  for (let attempt = 0; attempt < 60; attempt++) {
    const hue = between(random, 0, 360)
    const scheme = schemes[Math.floor(random() * schemes.length)] ?? 'analogous'
    const [primaryShift, accentShift] = SCHEMES[scheme]
    const primaryHue = (hue + primaryShift + 360) % 360
    // Weddings love gold: a warm metallic accent a third of the time.
    const accentHue =
      random() < 0.35
        ? between(random, 70, 90)
        : (hue + accentShift + 360) % 360

    const bg = {
      c: between(random, 0.006, 0.03),
      h: hue,
      l: between(random, 0.955, 0.985),
    }
    const bgHex = oklchToHex(bg)
    const surface = {
      c: bg.c + between(random, 0.005, 0.02),
      h: hue,
      l: bg.l - between(random, 0.025, 0.05),
    }
    const ink = {
      c: between(random, 0.01, 0.05),
      h: hue,
      l: between(random, 0.22, 0.32),
    }
    const muted = darkenUntil(
      { c: between(random, 0.02, 0.05), h: hue, l: between(random, 0.5, 0.58) },
      bgHex,
      4.5
    )
    const primary = {
      c: between(random, 0.06, 0.14),
      h: primaryHue,
      l: between(random, 0.38, 0.52),
    }
    const accent = darkenUntil(
      {
        c: between(random, 0.08, 0.14),
        h: accentHue,
        l: between(random, 0.55, 0.66),
      },
      bgHex,
      4.5
    )
    const accentHex = oklchToHex(accent)
    // Starts light and darkens only as far as the accent needs, with
    // enough chroma to read as navy / wine / forest rather than black.
    const strong = darkenUntil(
      {
        c: between(random, 0.07, 0.12),
        h: random() < 0.5 ? hue : primaryHue,
        l: between(random, 0.36, 0.42),
      },
      accentHex,
      3
    )

    const palette: Palette = {
      accent: accentHex,
      bg: bgHex,
      ink: oklchToHex(ink),
      muted: oklchToHex(muted),
      onPrimary: bgHex,
      onStrong: oklchToHex({ c: bg.c, h: hue, l: 0.97 }),
      primary: oklchToHex(primary),
      strong: oklchToHex(strong),
      surface: oklchToHex(surface),
    }
    if (isReadable(palette)) return palette
  }
  // Practically unreachable; a safe neutral palette.
  return {
    accent: '#8A6A2E',
    bg: '#FAF7F0',
    ink: '#3B3A33',
    muted: '#6E675A',
    onPrimary: '#FAF7F0',
    onStrong: '#F3EEE2',
    primary: '#4A5A48',
    strong: '#2F3A2E',
    surface: '#F1ECDF',
  }
}
