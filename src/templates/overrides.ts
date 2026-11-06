import { luminance } from '@/lib/contrast'
import { z } from 'zod'

import { FONT_OPTIONS, type FontKey } from './font-options'
import { MOTION_PRESETS, type Theme } from './types'

const Hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color inválido.')
const FontKeySchema = z.enum(
  Object.keys(FONT_OPTIONS) as [FontKey, ...FontKey[]]
)

/** Theme colors an event can change (`card` is derived from `bg`). */
export const COLOR_KEYS = [
  'bg',
  'surface',
  'strong',
  'onStrong',
  'ink',
  'muted',
  'accent',
  'primary',
  'onPrimary',
] as const

export type ColorKey = (typeof COLOR_KEYS)[number]

/**
 * What an event changes from its template ("Diseño" tab), stored in
 * `events.theme_overrides`. Every field is optional: anything left out
 * keeps the template's value.
 */
export const ThemeOverridesSchema = z.object({
  colors: z.partialRecord(z.enum(COLOR_KEYS), Hex).optional(),
  envelope: z
    .object({
      decorationImage: z.url().optional(),
      ink: Hex.optional(),
      paperColor: Hex.optional(),
      paperImage: z.url().optional(),
      seal: Hex.optional(),
      sealImage: z.url().optional(),
    })
    .optional(),
  fonts: z
    .object({
      body: FontKeySchema.optional(),
      caps: FontKeySchema.optional(),
      display: FontKeySchema.optional(),
      script: FontKeySchema.optional(),
    })
    .optional(),
  /** Scroll animations of the invitation. */
  motion: z.enum(MOTION_PRESETS).optional(),
  /** Picture behind the invitation and the envelope. */
  stageImage: z.url().optional(),
})

export type ThemeOverrides = z.infer<typeof ThemeOverridesSchema>

/**
 * Reads `events.theme_overrides` leniently: an invalid value counts as "no
 * changes", so a bad row never breaks the invitation.
 *
 * @param value - Raw column value.
 */
export function parseOverrides(value: unknown): ThemeOverrides {
  const parsed = ThemeOverridesSchema.safeParse(value)
  return parsed.success ? parsed.data : {}
}

/**
 * Card panel for a background: light veil on light paper, faint one on
 * dark backgrounds.
 *
 * @param bg - Background color.
 */
function cardFor(bg: string): string {
  return luminance(bg) > 0.4
    ? 'rgba(255, 255, 255, 0.4)'
    : 'rgba(255, 255, 255, 0.06)'
}

/**
 * The template theme with the event's changes applied.
 *
 * @param theme - Template theme.
 * @param overrides - Event changes.
 */
export function applyOverrides(theme: Theme, overrides: ThemeOverrides): Theme {
  const colors = { ...theme.colors, ...overrides.colors }
  if (overrides.colors?.bg) colors.card = cardFor(overrides.colors.bg)

  const fonts = { ...theme.fonts }
  for (const [slot, key] of Object.entries(overrides.fonts ?? {})) {
    if (key) fonts[slot as keyof typeof fonts] = FONT_OPTIONS[key].css
  }

  const envelope = { ...theme.envelope }
  const changes = overrides.envelope ?? {}
  if (changes.paperImage) {
    envelope.paper = `url('${changes.paperImage}') center / cover, ${changes.paperColor ?? colors.primary}`
  } else if (changes.paperColor) {
    envelope.paper = changes.paperColor
  }
  if (changes.ink) envelope.ink = changes.ink
  if (changes.seal) envelope.seal = changes.seal
  if (changes.sealImage) envelope.sealImage = changes.sealImage
  if (changes.decorationImage)
    envelope.decorationImage = changes.decorationImage

  return {
    ...theme,
    colors,
    envelope,
    fonts,
    motion: overrides.motion ?? theme.motion,
    stage: overrides.stageImage
      ? `url('${overrides.stageImage}') center / cover no-repeat, ${colors.bg}`
      : theme.stage,
  }
}
