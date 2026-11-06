'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ImageUpIcon, Loader2Icon } from 'lucide-react'
import { type ReactNode, useId, useState } from 'react'

import { useImageUploadFor } from '../sections-editor/useImageUpload'

interface ArtImageFieldProps {
  eventId: string
  label: string
  hint: string
  /** Event's picture, if any. */
  value: string | undefined
  /** Template's picture, shown when the event has none. */
  templateImage?: string
  /** Shape of the preview box. */
  shape: 'wide' | 'square' | 'tall'
  onChange: (url: string | undefined) => void
}

const SHAPES = {
  square: 'aspect-square w-24',
  tall: 'aspect-[3/4] w-24',
  wide: 'aspect-[3/2] w-36',
}

/**
 * One design picture (stage, envelope paper, seal, decoration): upload,
 * replace or go back to the template's.
 *
 * @param props - Component props.
 * @param props.eventId - Event the picture belongs to.
 * @param props.hint - What to upload (size, transparency).
 * @param props.label - Picture name.
 * @param props.onChange - New URL, or `undefined` for the template's.
 * @param props.shape - Preview shape.
 * @param props.templateImage - Template default.
 * @param props.value - Event's picture.
 */
export function ArtImageField({
  eventId,
  hint,
  label,
  onChange,
  shape,
  templateImage,
  value,
}: ArtImageFieldProps): ReactNode {
  const upload = useImageUploadFor(eventId)
  const inputId = useId()
  const [uploading, setUploading] = useState(false)
  const shown = value ?? templateImage

  return (
    <div className="flex items-start gap-3">
      <label
        className={cn(
          'relative flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-dashed bg-[repeating-conic-gradient(#eee_0_25%,#fff_0_50%)] bg-[length:12px_12px] text-muted-foreground',
          SHAPES[shape]
        )}
        htmlFor={inputId}
        title="Subir imagen"
      >
        {shown ? (
          // Our bucket or the template's own file.
          // oxlint-disable-next-line nextjs/no-img-element
          <img alt="" className="size-full object-cover" src={shown} />
        ) : (
          <ImageUpIcon className="size-6" />
        )}
        {uploading ? (
          <span className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2Icon className="size-5 animate-spin" />
          </span>
        ) : null}
      </label>
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-sm font-medium">
          {label}
          {value ? null : (
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              · {templateImage ? 'plantilla' : 'sin imagen'}
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">{hint}</p>
        <div className="flex gap-1">
          <Button
            disabled={uploading}
            onClick={() => document.getElementById(inputId)?.click()}
            size="xs"
            type="button"
            variant="outline"
          >
            {uploading ? 'Subiendo…' : value ? 'Cambiar' : 'Subir'}
          </Button>
          {value ? (
            <Button
              onClick={() => onChange(undefined)}
              size="xs"
              type="button"
              variant="ghost"
            >
              {templateImage ? 'Volver a la plantilla' : 'Quitar'}
            </Button>
          ) : null}
        </div>
      </div>
      <input
        accept="image/*"
        className="sr-only"
        id={inputId}
        onChange={(event) => {
          const input = event.currentTarget
          const file = input.files?.[0]
          input.value = ''
          if (!file) return
          setUploading(true)
          void upload(file).then((url) => {
            setUploading(false)
            if (url) onChange(url)
          })
        }}
        tabIndex={-1}
        type="file"
      />
    </div>
  )
}
