'use client'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { FieldNode } from '@/sections/form-fields'
import type { ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'

import { useFieldError } from './useFieldError'

type InputNode = Extract<
  FieldNode,
  { kind: 'text' | 'textarea' | 'url' | 'color' | 'number' }
>

/**
 * Reads a number input: empty means "not set".
 *
 * @param value - Raw input value.
 */
function toOptionalNumber(value: string): number | undefined {
  return value === '' ? undefined : Number(value)
}

/**
 * Text-like input: text, long text, link, number or color.
 *
 * @param props - Component props.
 * @param props.name - Form path.
 * @param props.node - Field description.
 */
export function InputField({
  name,
  node,
}: {
  name: string
  node: InputNode
}): ReactNode {
  const { register } = useFormContext()
  const error = useFieldError(name)
  const invalid = error ? true : undefined
  const label = node.required ? node.label : `${node.label} (opcional)`

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      {node.kind === 'textarea' ? (
        <Textarea
          aria-invalid={invalid}
          id={name}
          rows={3}
          {...register(name)}
        />
      ) : (
        <Input
          aria-invalid={invalid}
          id={name}
          inputMode={node.kind === 'number' ? 'numeric' : undefined}
          placeholder={node.kind === 'url' ? 'https://…' : undefined}
          type={
            node.kind === 'number'
              ? 'number'
              : node.kind === 'url'
                ? 'url'
                : 'text'
          }
          {...register(
            name,
            node.kind === 'number'
              ? { setValueAs: toOptionalNumber }
              : undefined
          )}
        />
      )}
      {node.description ? (
        <FieldDescription>{node.description}</FieldDescription>
      ) : null}
      <FieldError errors={[error]} />
    </Field>
  )
}
