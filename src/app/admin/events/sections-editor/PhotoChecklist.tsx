'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { sectionCatalog } from '@/sections/catalog'
import type { ImageSlot } from '@/sections/images'
import { CheckIcon, CopyIcon, ImageIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'

/** How each crop is described to the client. */
const ASPECT_TEXT: Record<ImageSlot['aspect'], string> = {
  '1:1': 'cuadrada',
  '3:4': 'vertical',
  '9:16': 'vertical de pantalla completa',
}

export interface ChecklistSlot extends ImageSlot {
  /** Text that tells apart sections of the same type, e.g. "Recepción". */
  sectionName: string | null
}

/**
 * Builds the message asking the client for the photos still missing.
 *
 * @param missing - Slots without a photo.
 */
function requestMessage(missing: ChecklistSlot[]): string {
  const lines = missing.map((slot) => {
    const where = slot.sectionName ? ` (${slot.sectionName})` : ''
    const optional = slot.required ? '' : ' — opcional'
    return `• ${slot.label}${where}: foto ${ASPECT_TEXT[slot.aspect]}${optional}`
  })
  return [
    'Hola, para tu invitación necesito estas fotos:',
    ...lines,
    '',
    'Mándalas en la mejor calidad que tengas, sin filtros de WhatsApp si se puede (como documento).',
  ].join('\n')
}

/**
 * Photos the invitation needs from the client, with their status. A slot
 * counts as done once its section is saved with the photo.
 *
 * @param props - Component props.
 * @param props.onOpen - Opens the section that holds a slot.
 * @param props.slots - Photo slots of the visible sections.
 */
export function PhotoChecklist({
  onOpen,
  slots,
}: {
  slots: ChecklistSlot[]
  onOpen: (sectionId: string) => void
}): ReactNode {
  if (slots.length === 0) return null

  const done = slots.filter((slot) => slot.value).length
  const missing = slots.filter((slot) => !slot.value)
  const missingRequired = missing.filter((slot) => slot.required).length

  /** Copies the request for the missing photos, ready for WhatsApp. */
  async function copyRequest(): Promise<void> {
    try {
      await navigator.clipboard.writeText(requestMessage(missing))
      toast.success('Lista copiada. Pégala en WhatsApp.')
    } catch {
      toast.error('No se pudo copiar.')
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-background p-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium">Fotos del cliente</h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {done} de {slots.length}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${(done / slots.length) * 100}%` }}
        />
      </div>

      <ul className="flex flex-col gap-1">
        {slots.map((slot) => (
          <li key={`${slot.sectionId}.${slot.field}`}>
            <button
              className="flex w-full items-center gap-2 rounded-md p-1 text-left hover:bg-muted"
              onClick={() => onOpen(slot.sectionId)}
              type="button"
            >
              <span
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted text-muted-foreground',
                  !slot.value && slot.required && 'border-amber-500'
                )}
              >
                {slot.value ? (
                  // Thumbnail from our bucket.
                  // oxlint-disable-next-line nextjs/no-img-element
                  <img
                    alt=""
                    className="size-full object-cover"
                    src={slot.value}
                  />
                ) : (
                  <ImageIcon className="size-4" />
                )}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-xs font-medium">
                  {slot.label}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {slot.sectionName ?? sectionCatalog[slot.sectionType].label}
                  {' · '}
                  {ASPECT_TEXT[slot.aspect]}
                  {slot.required ? '' : ' · opcional'}
                </span>
              </span>
              {slot.value ? (
                <CheckIcon className="size-4 shrink-0 text-emerald-600" />
              ) : null}
            </button>
          </li>
        ))}
      </ul>

      {missing.length > 0 ? (
        <>
          {missingRequired > 0 ? (
            <p className="text-xs text-amber-700 dark:text-amber-400">
              {missingRequired === 1
                ? 'Falta 1 foto obligatoria: su sección no se muestra hasta tenerla.'
                : `Faltan ${missingRequired} fotos obligatorias: sus secciones no se muestran hasta tenerlas.`}
            </p>
          ) : null}
          <Button
            onClick={() => void copyRequest()}
            size="sm"
            type="button"
            variant="outline"
          >
            <CopyIcon /> Copiar lista para el cliente
          </Button>
        </>
      ) : (
        <p className="text-xs text-emerald-700 dark:text-emerald-400">
          Todas las fotos están listas.
        </p>
      )}
    </div>
  )
}
