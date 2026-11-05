import type { CSSProperties } from 'react'

import { beigeOliva } from './beige-oliva/theme'
import { lilaReal } from './lila-real/theme'
import type { Template, Theme } from './types'

export const templates: Record<string, Template> = {
  [beigeOliva.key]: beigeOliva,
  [lilaReal.key]: lilaReal,
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
 * utilities (`bg-inv-surface`, `font-script`, ...).
 *
 * @param theme - Theme to apply.
 */
export function themeToCssVariables(theme: Theme): CSSProperties {
  return {
    '--inv-accent': theme.colors.accent,
    '--inv-bg': theme.colors.bg,
    '--inv-envelope-ink': theme.envelope.ink,
    '--inv-envelope-paper': theme.envelope.paper,
    '--inv-envelope-seal': theme.envelope.seal,
    '--inv-font-body': theme.fonts.body,
    '--inv-font-caps': theme.fonts.caps,
    '--inv-font-display': theme.fonts.display,
    '--inv-font-script': theme.fonts.script,
    '--inv-ink': theme.colors.ink,
    '--inv-muted': theme.colors.muted,
    '--inv-on-primary': theme.colors.onPrimary,
    '--inv-on-strong': theme.colors.onStrong,
    '--inv-primary': theme.colors.primary,
    '--inv-stage': theme.stage,
    '--inv-strong': theme.colors.strong,
    '--inv-surface': theme.colors.surface,
    '--inv-texture': theme.texture,
  } as CSSProperties
}
