export type OrnamentKind = 'sprig' | 'flourish'

export interface Theme {
  colors: {
    /** Main invitation background. */
    bg: string
    /** Alternate band background ("soft" sections). */
    surface: string
    /** Dark band background ("strong" sections, footer). */
    strong: string
    /** Text on `strong`. */
    onStrong: string
    /** Main text color. */
    ink: string
    /** Secondary text, hairlines and borders. */
    muted: string
    /** Ornaments, eyebrows, script accents (usually gold). */
    accent: string
    /** Buttons and selected states. */
    primary: string
    /** Text on `primary`. */
    onPrimary: string
  }
  fonts: {
    /** Titles and names. CSS `font-family` value. */
    display: string
    /** Body text. */
    body: string
    /** Small caps eyebrows and labels. */
    caps: string
    /** Handwritten accents ("&", names on photo heroes). */
    script: string
  }
  /** CSS `background` behind the invitation card on wide screens. */
  stage: string
  /** CSS `background` layered on "soft" bands (textures, marble...). */
  texture: string
  envelope: {
    /** CSS `background` of the envelope paper. */
    paper: string
    /** Wax seal color. */
    seal: string
    /** Text on the envelope. */
    ink: string
  }
  ornament: OrnamentKind
}

export interface Template {
  key: string
  name: string
  theme: Theme
}
