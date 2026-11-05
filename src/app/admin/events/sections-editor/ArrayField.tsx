'use client'

import { Button } from '@/components/ui/button'
import { FieldDescription, FieldError } from '@/components/ui/field'
import { type FieldNode, withFormDefaults } from '@/sections/form-fields'
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { ObjectFields } from './ObjectFields'
import { useFieldError } from './useFieldError'

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
  const item = node.item
  if (item.kind !== 'object') return null

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
      <Button
        className="self-start"
        onClick={() => append(withFormDefaults(item, undefined))}
        size="sm"
        type="button"
        variant="outline"
      >
        <PlusIcon /> Agregar
      </Button>
      <FieldError errors={[error]} />
    </fieldset>
  )
}
