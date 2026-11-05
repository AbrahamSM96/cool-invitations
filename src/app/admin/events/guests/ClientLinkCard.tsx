'use client'

import { Button, buttonVariants } from '@/components/ui/button'
import { CopyIcon, ExternalLinkIcon, RefreshCwIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type ReactNode, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { regenerateClientToken } from './actions'

/**
 * The client's private page link: copy, open, or replace it if it leaked.
 *
 * @param props - Component props.
 * @param props.clientToken - Current token.
 * @param props.eventId - Event id.
 */
export function ClientLinkCard({
  clientToken,
  eventId,
}: {
  clientToken: string
  eventId: string
}): ReactNode {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()
  const path = `/c/${clientToken}`

  /** Copies the full link. */
  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`)
      toast.success('Link del cliente copiado')
    } catch {
      toast.error('No se pudo copiar.')
    }
  }

  /** Replaces the token after confirmation. */
  function regenerate(): void {
    startTransition(async () => {
      const result = await regenerateClientToken(eventId)
      setConfirming(false)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Link nuevo creado. El anterior ya no funciona.')
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-background p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Link privado del cliente</p>
        <p className="text-xs text-muted-foreground">
          Ve a sus invitados, las respuestas y envía los links por WhatsApp. Sin
          contraseña: compártelo solo con el cliente.
        </p>
      </div>
      {confirming ? (
        <div className="flex items-center gap-2 text-sm">
          ¿Crear uno nuevo? El actual dejará de funcionar.
          <Button
            disabled={pending}
            onClick={regenerate}
            size="sm"
            type="button"
            variant="destructive"
          >
            Sí, cambiar
          </Button>
          <Button
            onClick={() => setConfirming(false)}
            size="sm"
            type="button"
            variant="ghost"
          >
            No
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button onClick={() => void copy()} size="sm" type="button">
            <CopyIcon /> Copiar
          </Button>
          <a
            className={buttonVariants({ size: 'sm', variant: 'outline' })}
            href={path}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLinkIcon /> Abrir
          </a>
          <Button
            aria-label="Cambiar link del cliente"
            onClick={() => setConfirming(true)}
            size="sm"
            title="Cambiar link (si se filtró)"
            type="button"
            variant="ghost"
          >
            <RefreshCwIcon />
          </Button>
        </div>
      )}
    </div>
  )
}
