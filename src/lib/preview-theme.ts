/** Message the design tab sends to the preview with the draft theme. */
export const PREVIEW_THEME_MESSAGE = 'cool-invitations:preview-theme'

export interface PreviewThemeMessage {
  type: typeof PREVIEW_THEME_MESSAGE
  /** CSS variables from `themeToCssVariables`. */
  vars: Record<string, string>
}

/**
 * Tells whether a `message` event payload is a preview theme update.
 *
 * @param data - `MessageEvent.data`.
 */
export function isPreviewThemeMessage(
  data: unknown
): data is PreviewThemeMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as { type?: unknown }).type === PREVIEW_THEME_MESSAGE &&
    typeof (data as { vars?: unknown }).vars === 'object'
  )
}
