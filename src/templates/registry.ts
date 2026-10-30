import type { CSSProperties } from 'react'

import { beigeOliva } from './beige-oliva/theme'
import type { Template, Theme } from './types'

export const templates: Record<string, Template> = {
  [beigeOliva.key]: beigeOliva,
}

/**
 * Resolves a template by key, falling back to the default template.
 *
 * @param key - `events.template_key`.
 */
export function getTemplate(key: string): Template {
  return templates[key] ?? beigeOliva
}

/**
 * Turns a theme into the CSS variables read by the invitation's Tailwind
 * utilities (`bg-inv-bg`, `font-display`, ...).
 *
 * @param theme - Theme to apply.
 */
export function themeToCssVariables(theme: Theme): CSSProperties {
  return {
    '--inv-accent': theme.colors.accent,
    '--inv-bg': theme.colors.bg,
    '--inv-font-body': theme.fonts.body,
    '--inv-font-caps': theme.fonts.caps,
    '--inv-font-display': theme.fonts.display,
    '--inv-ink': theme.colors.ink,
    '--inv-muted': theme.colors.muted,
    '--inv-on-accent': theme.colors.onAccent,
  } as CSSProperties
}
