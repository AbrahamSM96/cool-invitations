'use client'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { ComponentProps, ReactNode } from 'react'
import { type FieldPath, useFormContext } from 'react-hook-form'

import type { GuestFormInput } from './schema'

interface GuestFieldProps extends Omit<ComponentProps<'input'>, 'name' | 'id'> {
  name: FieldPath<GuestFormInput>
  label: string
  description?: string
  multiline?: boolean
}

/**
 * Labeled input of the guest form, with its validation message.
 *
 * @param props - Field props; the rest go to the input.
 * @param props.description - Help text.
 * @param props.label - Visible label.
 * @param props.multiline - Use a textarea.
 * @param props.name - Form field.
 */
export function GuestField({
  description,
  label,
  multiline = false,
  name,
  ...inputProps
}: GuestFieldProps): ReactNode {
  const { formState, getFieldState, register } =
    useFormContext<GuestFormInput>()
  const { error } = getFieldState(name, formState)
  const invalid = error ? true : undefined
  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={`guest-${name}`}>{label}</FieldLabel>
      {multiline ? (
        <Textarea
          aria-invalid={invalid}
          id={`guest-${name}`}
          rows={2}
          {...register(name)}
        />
      ) : (
        <Input
          aria-invalid={invalid}
          id={`guest-${name}`}
          {...inputProps}
          {...register(name)}
        />
      )}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={[error]} />
    </Field>
  )
}
