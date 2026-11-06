'use client'

import { Button } from '@/components/ui/button'
import { FieldDescription, FieldError } from '@/components/ui/field'
import { type FieldNode, withFormDefaults } from '@/sections/form-fields'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ImagePlusIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react'
import { type ReactNode, useId, useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { ObjectFields } from './ObjectFields'
import { useFieldError } from './useFieldError'
import { useImageUpload } from './useImageUpload'

/**
 * Repeatable group of fields (bank accounts, family groups...), with add,
 * remove and move buttons.
 *
 * @param props - Component props.
 * @param props.name - Path of the list.
 * @param props.node - List description; items are objects.
 * @param props.variant - Current section layout.
 */
export function ArrayField({
  name,
  node,
  variant,
}: {
  name: string
  node: Extract<FieldNode, { kind: 'array' }>
  variant: string | null
}): ReactNode {
  const { control } = useFormContext()
  const { append, fields, move, remove } = useFieldArray({ control, name })
  const error = useFieldError(name)
  const uploadImage = useImageUpload()
  const bulkInputId = useId()
  const [progress, setProgress] = useState<{
    done: number
    total: number
  } | null>(null)
  const item = node.item
  if (item.kind !== 'object') return null
  // Lists of photos (gallery) get a "pick many at once" button.
  const imageKey = item.fields.find(([, field]) => field.kind === 'image')?.[0]

  /**
   * Uploads several photos one after another, adding an item for each.
   *
   * @param files - Picked files.
   */
  async function uploadMany(files: File[]): Promise<void> {
    if (!imageKey || item.kind !== 'object') return
    setProgress({ done: 0, total: files.length })
    for (const [index, file] of files.entries()) {
      const url = await uploadImage(file)
      if (url) {
        append({
          ...(withFormDefaults(item, undefined) as object),
          [imageKey]: url,
        })
      }
      setProgress({ done: index + 1, total: files.length })
    }
    setProgress(null)
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 text-sm font-medium">{node.label}</legend>
      {node.description ? (
        <FieldDescription>{node.description}</FieldDescription>
      ) : null}
      {fields.map((field, index) => (
        <div
          className="flex flex-col gap-4 rounded-lg border p-4"
          key={field.id}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {index + 1}
            </span>
            <div className="flex gap-1">
              <Button
                aria-label="Subir"
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <ArrowUpIcon />
              </Button>
              <Button
                aria-label="Bajar"
                disabled={index === fields.length - 1}
                onClick={() => move(index, index + 1)}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <ArrowDownIcon />
              </Button>
              <Button
                aria-label="Quitar"
                onClick={() => remove(index)}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <Trash2Icon />
              </Button>
            </div>
          </div>
          <ObjectFields
            name={`${name}.${index}`}
            node={item}
            variant={variant}
          />
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        {imageKey ? (
          <>
            <Button
              disabled={progress !== null}
              onClick={() => document.getElementById(bulkInputId)?.click()}
              size="sm"
              type="button"
            >
              <ImagePlusIcon />
              {progress
                ? `Subiendo ${progress.done} de ${progress.total}…`
                : 'Subir varias fotos'}
            </Button>
            <input
              accept="image/*"
              className="sr-only"
              id={bulkInputId}
              multiple
              onChange={(event) => {
                const input = event.currentTarget
                const files = [...(input.files ?? [])]
                input.value = ''
                if (files.length > 0) void uploadMany(files)
              }}
              tabIndex={-1}
              type="file"
            />
          </>
        ) : null}
        <Button
          disabled={progress !== null}
          onClick={() => append(withFormDefaults(item, undefined))}
          size="sm"
          type="button"
          variant="outline"
        >
          <PlusIcon /> Agregar
        </Button>
      </div>
      <FieldError errors={[error]} />
    </fieldset>
  )
}
