import {
  Bebas_Neue,
  Bodoni_Moda,
  Cinzel,
  Cormorant_Garamond,
  EB_Garamond,
  Great_Vibes,
  Josefin_Sans,
  Lobster,
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

const bodoni = Bodoni_Moda({
  preload: false,
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-bodoni',
})

const josefin = Josefin_Sans({
  preload: false,
  subsets: ['latin'],
  variable: '--font-josefin',
  weight: ['300', '400', '600'],
})

const bebas = Bebas_Neue({
  preload: false,
  subsets: ['latin'],
  variable: '--font-bebas',
  weight: '400',
})

const lobster = Lobster({
  preload: false,
  subsets: ['latin'],
  variable: '--font-lobster',
  weight: '400',
})

/** Class names that expose every invitation font as a CSS variable. */
export const templateFontVariables = [
  cormorant.variable,
  ebGaramond.variable,
  cinzel.variable,
  pinyonScript.variable,
  greatVibes.variable,
  playfair.variable,
  bodoni.variable,
  josefin.variable,
  bebas.variable,
  lobster.variable,
].join(' ')
