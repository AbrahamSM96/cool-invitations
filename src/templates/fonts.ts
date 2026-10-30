import { Cinzel, Cormorant_Garamond, EB_Garamond } from 'next/font/google'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['400', '500', '600'],
})

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-eb-garamond',
})

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
})

/** Class names that expose every invitation font as a CSS variable. */
export const templateFontVariables = [
  cormorant.variable,
  ebGaramond.variable,
  cinzel.variable,
].join(' ')
