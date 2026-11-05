'use client'

import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { FieldNode } from '@/sections/form-fields'
import { PlusIcon, XIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

/**
 * List of single values (names, palette colors). `useFieldArray` only
 * handles objects, so the whole list is one controlled value.
 *
 * @param props - Component props.
 * @param props.name - Path of the list.
 * @param props.node - List description; items are text or colors.
 */
export function PrimitiveListField({
  name,
  node,
}: {
  name: string
  node: Extract<FieldNode, { kind: 'array' }>
}): ReactNode {
  const { control, formState, getFieldState } = useFormContext()
  const isColor = node.item.kind === 'color'

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const items = (
          Array.isArray(field.value) ? field.value : []
        ) as string[]
        /**
         * Replaces the list with a new copy.
         *
         * @param next - New items.
         */
        const update = (next: string[]): void => field.onChange(next)

        return (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium">{node.label}</legend>
            {items.map((item, index) => {
              const itemError = getFieldState(
                `${name}.${index}`,
                formState
              ).error
              return (
                // Items have no id; position is their identity here.
                // oxlint-disable-next-line react/no-array-index-key
                <div className="flex flex-col gap-1" key={index}>
                  <div className="flex items-center gap-2">
                    <Input
                      aria-invalid={itemError ? true : undefined}
                      aria-label={`${node.item.label} ${index + 1}`}
                      className={isColor ? 'h-8 w-14 p-1' : undefined}
                      onChange={(event) =>
                        update(items.with(index, event.target.value))
                      }
                      type={isColor ? 'color' : 'text'}
                      value={item}
                    />
                    {isColor ? (
                      <span className="font-mono text-xs text-muted-foreground">
                        {item}
                      </span>
                    ) : null}
                    <Button
                      aria-label="Quitar"
                      onClick={() =>
                        update(items.filter((_, i) => i !== index))
                      }
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                    >
                      <XIcon />
                    </Button>
                  </div>
                  <FieldError errors={[itemError]} />
                </div>
              )
            })}
            <Button
              className="self-start"
              onClick={() => update([...items, isColor ? '#cccccc' : ''])}
              size="sm"
              type="button"
              variant="outline"
            >
              <PlusIcon /> Agregar {node.item.label.toLowerCase()}
            </Button>
            <FieldError errors={[fieldState.error]} />
          </fieldset>
        )
      }}
    />
  )
}
