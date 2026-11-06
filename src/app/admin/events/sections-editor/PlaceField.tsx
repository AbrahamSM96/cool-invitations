'use client'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
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

import { useEditorPlaces } from './EditorContext'

const NONE = 'none'

/**
 * Dropdown of the event's places; the section fills itself from the one
 * picked. "Ninguno" means the section's own fields are used.
 *
 * @param props - Component props.
 * @param props.name - Form path.
 * @param props.node - Field description.
 */
export function PlaceField({
  name,
  node,
}: {
  name: string
  node: Extract<FieldNode, { kind: 'place' }>
}): ReactNode {
  const { control } = useFormContext()
  const places = useEditorPlaces()
  const items: Record<string, string> = {
    [NONE]: 'Ninguno: escribir los datos aquí',
    ...Object.fromEntries(
      places.map((place) => [place.id, `${place.label} · ${place.name}`])
    ),
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value =
          typeof field.value === 'string' && field.value ? field.value : NONE
        // A deleted place shows as "Ninguno" so the admin notices.
        const known = value === NONE || Object.hasOwn(items, value)
        return (
          <Field data-invalid={fieldState.error ? true : undefined}>
            <FieldLabel htmlFor={name}>{node.label}</FieldLabel>
            <Select
              items={items}
              onValueChange={(next) => {
                if (typeof next === 'string')
                  field.onChange(next === NONE ? '' : next)
              }}
              value={known ? value : NONE}
            >
              <SelectTrigger className="w-full" id={name}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(items).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldDescription>
              {places.length === 0
                ? 'Este evento no tiene lugares. Agrégalos en la pestaña Datos.'
                : !known
                  ? 'El lugar que tenía ya no existe en el evento. Elige otro.'
                  : node.description}
            </FieldDescription>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )
      }}
    />
  )
}
