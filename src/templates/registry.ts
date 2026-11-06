import type { CSSProperties } from 'react'

import { beigeOliva } from './beige-oliva/theme'
import { lilaReal } from './lila-real/theme'
import { nocheDorada } from './noche-dorada/theme'
import type { Template, Theme } from './types'

export const templates: Record<string, Template> = {
  [beigeOliva.key]: beigeOliva,
  [lilaReal.key]: lilaReal,
  [nocheDorada.key]: nocheDorada,
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
 * CSS `url()` of a picture, or `none`.
 *
 * @param url - Picture URL, if any.
 */
function cssUrl(url: string | undefined): string {
  return url ? `url('${url}')` : 'none'
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
    '--inv-card': theme.colors.card,
    // Pictures are variables too, so the design tab can swap them live.
    '--inv-envelope-decoration': cssUrl(theme.envelope.decorationImage),
    '--inv-envelope-ink': theme.envelope.ink,
    '--inv-envelope-ornament': theme.envelope.decorationImage ? '0' : '1',
    '--inv-envelope-paper': theme.envelope.paper,
    '--inv-envelope-seal': theme.envelope.seal,
    '--inv-envelope-seal-image': cssUrl(theme.envelope.sealImage),
    '--inv-font-body': theme.fonts.body,
    '--inv-font-caps': theme.fonts.caps,
    '--inv-font-display': theme.fonts.display,
    '--inv-font-script': theme.fonts.script,
    '--inv-ink': theme.colors.ink,
    // Not used by CSS: carries the preset to the live preview, which turns
    // it back into `data-motion`.
    '--inv-motion': theme.motion ?? 'soft',
    '--inv-muted': theme.colors.muted,
    '--inv-on-primary': theme.colors.onPrimary,
    '--inv-on-strong': theme.colors.onStrong,
    '--inv-primary': theme.colors.primary,
    '--inv-stage': theme.stage,
    '--inv-strong': theme.colors.strong,
    '--inv-surface': theme.colors.surface,
    '--inv-texture': theme.texture,
    '--inv-texture-size': theme.textureSize ?? 'auto',
  } as CSSProperties
}
