'use client'

import { buttonVariants } from '@/components/ui/button'
import { PREVIEW_THEME_MESSAGE } from '@/lib/preview-theme'
import { ExternalLinkIcon } from 'lucide-react'
import { type ReactNode, useEffect, useRef, useState } from 'react'

/**
 * Phone-sized live preview of the invitation. Reloads when `version`
 * changes, i.e. after every saved change.
 *
 * @param props - Component props.
 * @param props.eventId - Event to preview.
 * @param props.version - Bumped by the editor after each save.
 * @param props.liveTheme - Unsaved theme to apply live.
 * @param props.withEnvelope - Show the envelope too.
 */
export function PreviewPane({
  eventId,
  liveTheme,
  version,
  withEnvelope = false,
}: {
  eventId: string
  version: number
  /** Show the envelope (the design tab), instead of skipping it. */
  withEnvelope?: boolean
  /** Unsaved theme (CSS variables), applied live inside the preview. */
  liveTheme?: Record<string, string>
}): ReactNode {
  const [asGuest, setAsGuest] = useState(false)
  const frame = useRef<HTMLIFrameElement>(null)

  // Send the draft theme on every change, and again when the preview
  // (re)loads and says it is ready.
  useEffect(() => {
    if (!liveTheme) return
    /** Posts the draft theme into the preview. */
    function send(): void {
      frame.current?.contentWindow?.postMessage(
        { type: PREVIEW_THEME_MESSAGE, vars: liveTheme },
        window.location.origin
      )
    }
    send()
    /**
     * Re-sends when the preview finished loading.
     *
     * @param event - Message from the preview.
     */
    function onReady(event: MessageEvent): void {
      if (
        event.origin === window.location.origin &&
        event.source === frame.current?.contentWindow &&
        (event.data as { type?: unknown } | null)?.type ===
          'cool-invitations:preview-ready'
      ) {
        send()
      }
    }
    window.addEventListener('message', onReady)
    return (): void => window.removeEventListener('message', onReady)
  }, [liveTheme])
  const base = `/admin/preview/${eventId}`
  // Usually no envelope: it would cover the card after every reload.
  const query = [withEnvelope ? null : 'envelope=0', asGuest ? 'guest=1' : null]
    .filter(Boolean)
    .join('&')
  const src = query ? `${base}?${query}` : base

  return (
    <div className="flex flex-col gap-2 xl:sticky xl:top-20">
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            checked={asGuest}
            className="size-3.5 accent-primary"
            onChange={(event) => setAsGuest(event.currentTarget.checked)}
            type="checkbox"
          />
          Ver como invitado
        </label>
        <a
          className={buttonVariants({ size: 'xs', variant: 'ghost' })}
          href={base}
          rel="noreferrer"
          target="_blank"
        >
          Abrir <ExternalLinkIcon />
        </a>
      </div>
      <div className="mx-auto h-[min(780px,calc(100vh-9rem))] w-[375px] overflow-hidden rounded-[2rem] border-8 border-foreground/85 bg-background shadow-xl">
        <iframe
          className="size-full"
          key={`${src}#${version}`}
          ref={frame}
          src={src}
          title="Vista previa de la invitación"
        />
      </div>
    </div>
  )
}
