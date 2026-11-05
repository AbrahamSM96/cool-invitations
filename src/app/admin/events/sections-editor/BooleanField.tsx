'use client'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import type { FieldNode } from '@/sections/form-fields'
import type { ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'

import { useFieldError } from './useFieldError'

/**
 * Checkbox for a yes/no field.
 *
 * @param props - Component props.
 * @param props.name - Form path.
 * @param props.node - Field description.
 */
export function BooleanField({
  name,
  node,
}: {
  name: string
  node: FieldNode
}): ReactNode {
  const { register } = useFormContext()
  const error = useFieldError(name)
  return (
    <Field orientation="horizontal">
      <input
        className="size-4 accent-primary"
        id={name}
        type="checkbox"
        {...register(name)}
      />
      <FieldLabel htmlFor={name}>{node.label}</FieldLabel>
      <FieldError errors={[error]} />
    </Field>
  )
}
