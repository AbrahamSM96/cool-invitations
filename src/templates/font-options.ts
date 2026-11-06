/**
 * Fonts an event can switch to in "Diseño". A closed list: every family is
 * already loaded by `fonts.ts` and pairs well with the others.
 */
export const FONT_OPTIONS = {
  bebas: {
    css: 'var(--font-bebas), sans-serif',
    label: 'Bebas Neue (condensada)',
  },
  bodoni: { css: 'var(--font-bodoni), serif', label: 'Bodoni Moda (moderna)' },
  cinzel: {
    css: 'var(--font-cinzel), serif',
    label: 'Cinzel (mayúsculas clásicas)',
  },
  cormorant: {
    css: 'var(--font-cormorant), serif',
    label: 'Cormorant (elegante)',
  },
  'eb-garamond': {
    css: 'var(--font-eb-garamond), serif',
    label: 'EB Garamond (lectura)',
  },
  'great-vibes': {
    css: 'var(--font-great-vibes), cursive',
    label: 'Great Vibes (manuscrita)',
  },
  josefin: {
    css: 'var(--font-josefin), sans-serif',
    label: 'Josefin Sans (art déco)',
  },
  lobster: { css: 'var(--font-lobster), cursive', label: 'Lobster (retro)' },
  pinyon: {
    css: 'var(--font-pinyon-script), cursive',
    label: 'Pinyon Script (caligrafía)',
  },
  playfair: {
    css: 'var(--font-playfair), serif',
    label: 'Playfair Display (editorial)',
  },
} as const

export type FontKey = keyof typeof FONT_OPTIONS

/** Theme font slots and how the CMS names them. */
export const FONT_SLOTS = {
  body: 'Texto',
  caps: 'Mayúsculas pequeñas',
  display: 'Títulos y nombres',
  script: 'Manuscrita (el "&", firmas)',
} as const

export type FontSlot = keyof typeof FONT_SLOTS

/**
 * Font option a theme's CSS value comes from, to show the template's
 * choice in the CMS. `null` for a value outside the list.
 *
 * @param css - CSS `font-family` value of a theme.
 */
export function fontKeyOf(css: string): FontKey | null {
  const entry = Object.entries(FONT_OPTIONS).find(
    ([, font]) => font.css === css
  )
  return entry ? (entry[0] as FontKey) : null
}
