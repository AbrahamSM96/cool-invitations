import { contrastRatio } from '@/lib/contrast'
import { READABILITY_RULES } from '@/lib/palette'
import type { ColorKey } from '@/templates/overrides'
import type { Theme } from '@/templates/types'

export const COLOR_LABELS: Record<ColorKey, { label: string; hint: string }> = {
  accent: { hint: 'Adornos, textos pequeños, el "&".', label: 'Acento' },
  bg: { hint: 'Fondo principal de la invitación.', label: 'Fondo' },
  ink: { hint: 'Texto principal.', label: 'Texto' },
  muted: { hint: 'Direcciones, notas, líneas.', label: 'Texto secundario' },
  onPrimary: {
    hint: 'Texto dentro de los botones.',
    label: 'Texto de botones',
  },
  onStrong: {
    hint: 'Texto sobre la franja intensa.',
    label: 'Texto en franja intensa',
  },
  primary: { hint: 'Botones y opciones elegidas.', label: 'Botones' },
  strong: { hint: 'Franjas oscuras (fecha, pie).', label: 'Franja intensa' },
  surface: { hint: 'Franjas alternas.', label: 'Franja suave' },
}

/**
 * Readability problems per text color: every background it sits on with
 * too little contrast (WCAG AA: 4.5:1, or 3:1 for large text). Only pairs touching a color the event
 * changed are checked: the template's own choices are not the admin's to
 * fix here.
 *
 * @param colors - Effective theme colors.
 * @param changed - Colors the event overrides.
 */
export function contrastWarnings(
  colors: Theme['colors'],
  changed: ReadonlySet<ColorKey>
): Partial<Record<ColorKey, string[]>> {
  const warnings: Partial<Record<ColorKey, string[]>> = {}
  for (const [text, background, min] of READABILITY_RULES) {
    if (!changed.has(text) && !changed.has(background)) continue
    const ratio = contrastRatio(colors[text], colors[background])
    if (ratio < min) {
      ;(warnings[text] ??= []).push(
        `Se lee mal sobre "${COLOR_LABELS[background].label}" (${ratio.toFixed(1)}:1, mínimo ${min}:1).`
      )
    }
  }
  return warnings
}
