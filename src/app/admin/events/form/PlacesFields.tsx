'use client'

import { Button } from '@/components/ui/button'
import { eventTypes } from '@/event-types'
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'

import type { EventFormInput } from '../schema'

import { TextField } from './TextField'

/**
 * The event's places (ceremony, reception...). "Lugar" sections pick one
 * of these instead of retyping the address.
 */
export function PlacesFields(): ReactNode {
  const { control } = useFormContext<EventFormInput>()
  const { append, fields, move, remove } = useFieldArray({
    control,
    keyName: 'key',
    name: 'places',
  })
  // Suggested roles depend on the type: a birthday usually has one place.
  const type = useWatch({ control, name: 'type' })
  const suggested = eventTypes[type].placeLabels

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field, index) => (
        <div
          className="flex flex-col gap-4 rounded-lg border p-4"
          key={field.key}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Lugar {index + 1}</span>
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
                aria-label="Quitar lugar"
                onClick={() => remove(index)}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <Trash2Icon />
              </Button>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              description="Para qué es este lugar."
              label="Momento"
              name={`places.${index}.label`}
              placeholder={suggested[index] ?? 'Fiesta'}
            />
            <TextField
              label="Tipo de lugar (opcional)"
              name={`places.${index}.placeType`}
              placeholder="Parroquia, Hotel, Jardín…"
            />
            <TextField
              label="Nombre del lugar"
              name={`places.${index}.name`}
              placeholder="Parroquia San José"
            />
            {index === 0 ? (
              <p className="self-end pb-2 text-sm text-muted-foreground">
                Empieza a la hora del evento (arriba, en Fecha y hora).
              </p>
            ) : (
              <TextField
                description="Ej. la recepción empieza después de la ceremonia."
                label="Hora"
                name={`places.${index}.time`}
                placeholder="7:00 PM"
              />
            )}
            <TextField
              className="sm:col-span-2"
              label="Dirección"
              name={`places.${index}.address`}
              placeholder="Av. Juárez 123, Centro, Guadalajara"
            />
            <TextField
              description="En Google Maps: Compartir → Copiar vínculo."
              inputMode="url"
              label="Link de Google Maps (opcional)"
              name={`places.${index}.mapsUrl`}
              placeholder="https://maps.app.goo.gl/…"
            />
          </div>
        </div>
      ))}
      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {suggested.length === 1
            ? `Normalmente es un lugar (${suggested[0]}).`
            : `Normalmente son ${suggested.length}: ${suggested.join(' y ')}.`}
        </p>
      ) : null}
      <Button
        className="self-start"
        disabled={fields.length >= 10}
        onClick={() =>
          append({
            address: '',
            id: crypto.randomUUID(),
            label: suggested[fields.length] ?? '',
            mapsUrl: '',
            name: '',
            placeType: '',
            time: '',
          })
        }
        size="sm"
        type="button"
        variant="outline"
      >
        <PlusIcon /> Agregar lugar
      </Button>
    </div>
  )
}
