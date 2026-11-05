import type { Template } from '../types'

export const beigeOliva: Template = {
  key: 'beige-oliva',
  name: 'Beige oliva',
  theme: {
    colors: {
      accent: '#B89A5C',
      bg: '#FAF7F0',
      ink: '#3B3A33',
      muted: '#8C8473',
      onPrimary: '#F7F3EA',
      onStrong: '#F3EEE2',
      primary: '#4A5A48',
      strong: '#4F5E4C',
      surface: '#F1ECDF',
    },
    envelope: {
      ink: '#F4EFE3',
      paper:
        'linear-gradient(115deg, #6E8366 0%, #6E8366 48%, #66795F 48%, #66795F 100%)',
      seal: '#C9A45A',
    },
    fonts: {
      body: 'var(--font-eb-garamond), serif',
      caps: 'var(--font-cinzel), serif',
      display: 'var(--font-cormorant), serif',
      script: 'var(--font-pinyon-script), cursive',
    },
    ornament: 'sprig',
    stage:
      'radial-gradient(ellipse at 15% 85%, #E6DCC8 0%, transparent 55%), radial-gradient(ellipse at 85% 80%, #E9E0CE 0%, transparent 50%), linear-gradient(180deg, #E8DFD0 0%, #DDD1BC 100%)',
    texture: 'none',
  },
}
