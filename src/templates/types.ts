export interface Theme {
  colors: {
    /** Page background. */
    bg: string
    /** Main text color. */
    ink: string
    /** Secondary text and borders. */
    muted: string
    /** Highlights: names, buttons, ornaments. */
    accent: string
    /** Text on top of `accent`. */
    onAccent: string
  }
  fonts: {
    /** Large titles and names. CSS `font-family` value. */
    display: string
    /** Body text. */
    body: string
    /** Small caps labels. */
    caps: string
  }
}

export interface Template {
  key: string
  name: string
  theme: Theme
}
