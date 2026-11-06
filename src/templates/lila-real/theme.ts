import type { Template } from '../types'

export const lilaReal: Template = {
  key: 'lila-real',
  name: 'Lila real',
  theme: {
    colors: {
      accent: '#B9975B',
      bg: '#FBF8FC',
      card: 'rgba(255, 255, 255, 0.45)',
      ink: '#3E3346',
      muted: '#8E7F98',
      onPrimary: '#FFFFFF',
      onStrong: '#F7F0FA',
      primary: '#8E6FAF',
      strong: '#6E5390',
      surface: '#F3ECF7',
    },
    envelope: {
      ink: '#FFFFFF',
      paper:
        'radial-gradient(circle at 30% 20%, #CDB7E3 0%, transparent 45%), radial-gradient(circle at 75% 80%, #B79BD6 0%, transparent 50%), linear-gradient(160deg, #A98BCB 0%, #8E6FAF 100%)',
      seal: '#C9A45A',
    },
    fonts: {
      body: 'var(--font-playfair), serif',
      caps: 'var(--font-cinzel), serif',
      display: 'var(--font-playfair), serif',
      script: 'var(--font-great-vibes), cursive',
    },
    ornament: 'flourish',
    stage:
      'radial-gradient(ellipse at 20% 20%, #F1E6F8 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, #E8DAF2 0%, transparent 55%), linear-gradient(135deg, #F7F1FA 0%, #E9DDF1 100%)',
    // Soft marble: layered blurred gradients instead of an image.
    texture:
      'radial-gradient(ellipse 60% 40% at 20% 30%, rgba(200,175,225,.35), transparent), radial-gradient(ellipse 50% 35% at 80% 70%, rgba(185,151,91,.12), transparent), radial-gradient(ellipse 70% 30% at 60% 10%, rgba(230,215,240,.6), transparent)',
  },
}
