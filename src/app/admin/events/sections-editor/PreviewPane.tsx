'use client'

import { buttonVariants } from '@/components/ui/button'
import { ExternalLinkIcon } from 'lucide-react'
import { type ReactNode, useState } from 'react'

/**
 * Phone-sized live preview of the invitation. Reloads when `version`
 * changes, i.e. after every saved change.
 *
 * @param props - Component props.
 * @param props.eventId - Event to preview.
 * @param props.version - Bumped by the editor after each save.
 */
export function PreviewPane({
  eventId,
  version,
}: {
  eventId: string
  version: number
}): ReactNode {
  const [asGuest, setAsGuest] = useState(false)
  const base = `/admin/preview/${eventId}`
  // No envelope here: it would cover the card after every reload.
  const src = `${base}?envelope=0${asGuest ? '&guest=1' : ''}`

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
          src={src}
          title="Vista previa de la invitación"
        />
      </div>
    </div>
  )
}
