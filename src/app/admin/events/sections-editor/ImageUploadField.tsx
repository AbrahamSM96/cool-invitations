'use client'

import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { cn } from '@/lib/utils'
import type { FieldNode } from '@/sections/form-fields'
import { ImageUpIcon, Loader2Icon } from 'lucide-react'
import { type ReactNode, useId, useRef, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { useImageUpload } from './useImageUpload'

const ASPECT_CLASS = {
  '1:1': 'aspect-square',
  '3:4': 'aspect-[3/4]',
  '9:16': 'aspect-[9/16]',
} as const

/**
 * Photo field: pick or drop a file, it is shrunk in the browser, uploaded,
 * and the field keeps its public URL. Saved with the section.
 *
 * @param props - Component props.
 * @param props.name - Form path.
 * @param props.node - Field description with the photo's aspect.
 */
export function ImageUploadField({
  name,
  node,
}: {
  name: string
  node: Extract<FieldNode, { kind: 'image' }>
}): ReactNode {
  const uploadImage = useImageUpload()
  const { control } = useFormContext()
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const label = node.required ? node.label : `${node.label} (opcional)`

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const url = typeof field.value === 'string' ? field.value : ''

        /**
         * Shrinks and uploads a file, then stores its URL in the field.
         *
         * @param file - Picked or dropped file.
         */
        async function upload(file: File): Promise<void> {
          setUploading(true)
          const uploaded = await uploadImage(file)
          setUploading(false)
          if (uploaded) field.onChange(uploaded)
        }

        return (
          <Field data-invalid={fieldState.error ? true : undefined}>
            <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
            <div
              className={cn(
                'relative flex w-40 items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/40 text-muted-foreground transition-colors',
                ASPECT_CLASS[node.image.aspect],
                dragging && 'border-foreground bg-muted',
                fieldState.error && 'border-destructive'
              )}
              onDragLeave={() => setDragging(false)}
              onDragOver={(event) => {
                event.preventDefault()
                setDragging(true)
              }}
              onDrop={(event) => {
                event.preventDefault()
                setDragging(false)
                const file = event.dataTransfer.files[0]
                if (file) void upload(file)
              }}
            >
              {url ? (
                // Photo from our bucket; a plain <img> keeps the preview simple.
                // oxlint-disable-next-line nextjs/no-img-element
                <img alt="" className="size-full object-cover" src={url} />
              ) : (
                <ImageUpIcon className="size-8" />
              )}
              {uploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                  <Loader2Icon className="size-6 animate-spin" />
                </div>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                size="sm"
                type="button"
                variant="outline"
              >
                {uploading ? 'Subiendo…' : url ? 'Cambiar foto' : 'Subir foto'}
              </Button>
              {url && !node.required ? (
                <Button
                  disabled={uploading}
                  onClick={() => field.onChange('')}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  Quitar
                </Button>
              ) : null}
            </div>
            <input
              accept="image/*"
              className="sr-only"
              id={inputId}
              onChange={(event) => {
                const input = event.currentTarget
                const file = input.files?.[0]
                // Reset so picking the same file again still fires.
                input.value = ''
                if (file) void upload(file)
              }}
              ref={inputRef}
              type="file"
            />
            <FieldDescription>
              {node.description} Arrastra la foto aquí o usa el botón.
            </FieldDescription>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )
      }}
    />
  )
}
