'use client'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FieldNode } from '@/sections/form-fields'
import type { ReactNode } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

/**
 * Dropdown for an enum field.
 *
 * @param props - Component props.
 * @param props.name - Form path.
 * @param props.node - Field description with its options.
 */
export function EnumField({
  name,
  node,
}: {
  name: string
  node: Extract<FieldNode, { kind: 'enum' }>
}): ReactNode {
  const { control } = useFormContext()
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.error ? true : undefined}>
          <FieldLabel htmlFor={name}>{node.label}</FieldLabel>
          <Select
            items={node.options}
            onValueChange={(value) => field.onChange(value)}
            value={typeof field.value === 'string' ? field.value : null}
          >
            <SelectTrigger className="w-full" id={name} onBlur={field.onBlur}>
              <SelectValue placeholder="Elige una opción" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(node.options).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}
