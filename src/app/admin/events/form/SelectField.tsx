'use client'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ReactNode } from 'react'
import { Controller, type FieldPath, useFormContext } from 'react-hook-form'

import type { EventFormInput } from '../schema'

interface SelectFieldProps {
  name: FieldPath<EventFormInput>
  label: string
  /** Value → visible label. */
  options: Record<string, string>
  /** Runs instead of the default update, e.g. to reset dependent fields. */
  onSelect?: (value: string) => void
}

/**
 * Labeled dropdown wired to the event form.
 *
 * @param props - Field props.
 * @param props.label - Visible label.
 * @param props.name - Form path.
 * @param props.onSelect - Custom change handler.
 * @param props.options - Choices, value → label.
 */
export function SelectField({
  label,
  name,
  onSelect,
  options,
}: SelectFieldProps): ReactNode {
  const { control } = useFormContext<EventFormInput>()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.error ? true : undefined}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Select
            items={options}
            onValueChange={(value) => {
              if (typeof value !== 'string') return
              if (onSelect) onSelect(value)
              else field.onChange(value)
            }}
            value={typeof field.value === 'string' ? field.value : null}
          >
            <SelectTrigger
              aria-invalid={fieldState.error ? true : undefined}
              className="w-full"
              id={name}
              onBlur={field.onBlur}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(options).map(([value, optionLabel]) => (
                <SelectItem key={value} value={value}>
                  {optionLabel}
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
