import {
  Cinzel,
  Cormorant_Garamond,
  EB_Garamond,
  Great_Vibes,
  Pinyon_Script,
  Playfair_Display,
} from 'next/font/google'

// `preload: false`: each invitation uses only its template's fonts, so the
// browser downloads just those instead of preloading every family.

const cormorant = Cormorant_Garamond({
  preload: false,
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600'],
})

const ebGaramond = EB_Garamond({
  preload: false,
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-eb-garamond',
})

const cinzel = Cinzel({
  preload: false,
  subsets: ['latin'],
  variable: '--font-cinzel',
})

const pinyonScript = Pinyon_Script({
  preload: false,
  subsets: ['latin'],
  variable: '--font-pinyon-script',
  weight: '400',
})

const greatVibes = Great_Vibes({
  preload: false,
  subsets: ['latin'],
  variable: '--font-great-vibes',
  weight: '400',
})

const playfair = Playfair_Display({
  preload: false,
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-playfair',
})

/** Class names that expose every invitation font as a CSS variable. */
export const templateFontVariables = [
  cormorant.variable,
  ebGaramond.variable,
  cinzel.variable,
  pinyonScript.variable,
  greatVibes.variable,
  playfair.variable,
].join(' ')
