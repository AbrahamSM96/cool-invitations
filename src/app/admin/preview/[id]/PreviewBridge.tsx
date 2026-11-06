'use client'

import { isPreviewThemeMessage } from '@/lib/preview-theme'
import { type ReactNode, useEffect } from 'react'

/**
 * Lets the design tab restyle this preview live: applies the CSS
 * variables it posts to the invitation, without saving or reloading.
 * Only messages from the admin itself (same origin) are accepted.
 */
export function PreviewBridge(): ReactNode {
  useEffect(() => {
    /**
     * Applies a theme update from the parent window.
     *
     * @param event - Incoming message.
     */
    function onMessage(event: MessageEvent): void {
      if (event.origin !== window.location.origin) return
      if (!isPreviewThemeMessage(event.data)) return
      const themed = document.querySelectorAll<HTMLElement>(
        '[data-invitation-theme]'
      )
      for (const element of themed) {
        for (const [name, value] of Object.entries(event.data.vars)) {
          if (!name.startsWith('--inv-') || typeof value !== 'string') continue
          // The motion preset is a data attribute, not a style.
          if (name === '--inv-motion') element.dataset.motion = value
          else element.style.setProperty(name, value)
        }
      }
    }
    window.addEventListener('message', onMessage)
    // Ask for the current draft: the parent may have changed it before this
    // page finished loading.
    window.parent.postMessage(
      { type: 'cool-invitations:preview-ready' },
      window.location.origin
    )
    return (): void => window.removeEventListener('message', onMessage)
  }, [])
  return null
}
