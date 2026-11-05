'use client'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { ComponentProps, ReactNode } from 'react'
import { type FieldPath, useFormContext } from 'react-hook-form'

import type { EventFormInput } from '../schema'

/**
 * Reads a number input: empty means "not set".
 *
 * @param value - Raw input value.
 */
function toOptionalNumber(value: string): number | undefined {
  return value === '' ? undefined : Number(value)
}

interface TextFieldProps extends Omit<ComponentProps<'input'>, 'name' | 'id'> {
  name: FieldPath<EventFormInput>
  label: string
  description?: ReactNode
  /** Turns the text into a number (empty = not set). */
  numeric?: boolean
}

/**
 * Labeled input wired to the event form, with its validation message.
 *
 * @param props - Field props; the rest go to the `<input>`.
 * @param props.description - Help text under the input.
 * @param props.label - Visible label.
 * @param props.name - Form path, e.g. `hosts.partner1.fullName`.
 * @param props.numeric - Store a number instead of text.
 */
export function TextField({
  description,
  label,
  name,
  numeric = false,
  ...inputProps
}: TextFieldProps): ReactNode {
  const { formState, getFieldState, register } =
    useFormContext<EventFormInput>()
  const { error } = getFieldState(name, formState)

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input
        aria-invalid={error ? true : undefined}
        id={name}
        {...inputProps}
        {...register(
          name,
          numeric ? { setValueAs: toOptionalNumber } : undefined
        )}
      />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={[error]} />
    </Field>
  )
}
