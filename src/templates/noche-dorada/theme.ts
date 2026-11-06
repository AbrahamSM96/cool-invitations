import type { Template } from '../types'

/** Black and gold, art-deco type: parties, birthdays and modern XV. */
export const nocheDorada: Template = {
  key: 'noche-dorada',
  name: 'Noche dorada',
  theme: {
    colors: {
      accent: '#D4AF63',
      bg: '#121110',
      card: 'rgba(212, 175, 99, 0.06)',
      ink: '#F2EADB',
      muted: '#A89D88',
      onPrimary: '#141210',
      onStrong: '#F2EADB',
      primary: '#D4AF63',
      // Dark bronze, not gold: gold accents must stay readable on it.
      strong: '#2B2418',
      surface: '#1B1916',
    },
    envelope: {
      ink: '#E9CF8E',
      paper:
        'radial-gradient(circle at 50% 30%, rgba(212,175,99,.22) 0%, transparent 55%), linear-gradient(160deg, #1E1B17 0%, #0D0C0B 100%)',
      seal: '#C9A45A',
    },
    fonts: {
      body: 'var(--font-josefin), sans-serif',
      caps: 'var(--font-josefin), sans-serif',
      display: 'var(--font-bodoni), serif',
      script: 'var(--font-great-vibes), cursive',
    },
    ornament: 'flourish',
    stage:
      'radial-gradient(ellipse at 50% 0%, rgba(212,175,99,.25) 0%, transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(212,175,99,.12) 0%, transparent 50%), #080807',
    // Fine gold dust: a repeating dot grid.
    texture:
      'radial-gradient(circle at 1px 1px, rgba(212, 175, 99, 0.16) 1px, transparent 0)',
    textureSize: '18px 18px',
  },
}
