'use client'

import type { ReactNode } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import type { EventFormInput } from '../schema'

import { SelectField } from './SelectField'
import { TextField } from './TextField'

const GENDERS = { female: 'Femenino', male: 'Masculino' }

/** People the event is about; the fields depend on the event type. */
export function HostsFields(): ReactNode {
  const { control } = useFormContext<EventFormInput>()
  const type = useWatch({ control, name: 'type' })

  if (type === 'wedding') {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          className="sm:col-span-2"
          description="Como aparece en la portada."
          label="Nombres de la pareja"
          name="hosts.coupleDisplay"
          placeholder="Viridiana & Daniel"
        />
        <TextField
          label="Nombre completo (1)"
          name="hosts.partner1.fullName"
          placeholder="Viridiana López"
        />
        <TextField
          label="Nombre corto (1)"
          name="hosts.partner1.shortName"
          placeholder="Viridiana"
        />
        <TextField
          label="Nombre completo (2)"
          name="hosts.partner2.fullName"
          placeholder="Daniel Pérez"
        />
        <TextField
          label="Nombre corto (2)"
          name="hosts.partner2.shortName"
          placeholder="Daniel"
        />
      </div>
    )
  }

  if (type === 'general') {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Nombre del evento"
          name="hosts.eventName"
          placeholder="Graduación 2026"
        />
        <TextField
          label="Quién invita"
          name="hosts.hostDisplay"
          placeholder="Familia Serrano"
        />
      </div>
    )
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <TextField
        label="Nombre completo"
        name="hosts.honoree.fullName"
        placeholder="Camila Hernández Ruiz"
      />
      <TextField
        description="Como aparece en la portada."
        label="Nombre corto"
        name="hosts.honoree.shortName"
        placeholder="Camila"
      />
      <SelectField
        label="Género"
        name="hosts.honoreeGender"
        options={GENDERS}
      />
      {type === 'birthday' ? (
        <TextField
          inputMode="numeric"
          label="Edad que cumple"
          min={1}
          name="hosts.age"
          numeric
          type="number"
        />
      ) : null}
    </div>
  )
}
