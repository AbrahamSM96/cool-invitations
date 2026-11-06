import type { Template } from '../types'

/** Pictures in `public/templates/beige-oliva`. */
const ASSETS = '/templates/beige-oliva'

export const beigeOliva: Template = {
  key: 'beige-oliva',
  name: 'Beige oliva',
  theme: {
    colors: {
      accent: '#B89A5C',
      bg: '#FAF7F0',
      card: 'rgba(255, 255, 255, 0.4)',
      ink: '#3B3A33',
      muted: '#8C8473',
      onPrimary: '#F7F3EA',
      onStrong: '#F3EEE2',
      primary: '#4A5A48',
      strong: '#4F5E4C',
      surface: '#F1ECDF',
    },
    envelope: {
      decorationImage: `${ASSETS}/envelope-sprig.webp`,
      ink: '#F4EFE3',
      paper: `url('${ASSETS}/envelope-paper.webp') center / cover, #7C8E6E`,
      seal: '#C9A45A',
      sealImage: `${ASSETS}/envelope-seal.webp`,
    },
    fonts: {
      body: 'var(--font-eb-garamond), serif',
      caps: 'var(--font-cinzel), serif',
      display: 'var(--font-cormorant), serif',
      script: 'var(--font-pinyon-script), cursive',
    },
    ornament: 'sprig',
    // Linen with baby's breath and eucalyptus, behind the card and envelope.
    stage: `url('${ASSETS}/stage.webp') center / cover no-repeat, #E8DFD0`,
    texture: 'none',
  },
}
