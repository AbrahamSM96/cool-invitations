'use client'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AdminGuest } from '@/data/admin-guests'
import { formatPhone } from '@/lib/phone'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import {
  Controller,
  type FieldPath,
  FormProvider,
  useForm,
} from 'react-hook-form'
import { toast } from 'sonner'

import { createGuest, updateGuest } from './actions'
import { GuestField } from './GuestField'
import { GuestForm, type GuestFormData, type GuestFormInput } from './schema'

const STATUS_OPTIONS = { disabled: 'Deshabilitado', enabled: 'Habilitado' }

const EMPTY: GuestFormInput = {
  adults: '',
  displayName: '',
  group: '',
  kids: '',
  maxPasses: 1,
  notes: '',
  personalMessage: '',
  phone: '',
  status: 'enabled',
  table: '',
}

/**
 * Form values of a saved guest.
 *
 * @param guest - Guest to edit.
 */
function toInput(guest: AdminGuest): GuestFormInput {
  return {
    adults: guest.adults ?? '',
    displayName: guest.displayName,
    group: guest.group ?? '',
    kids: guest.kids ?? '',
    maxPasses: guest.maxPasses,
    notes: guest.notes ?? '',
    personalMessage: guest.personalMessage ?? '',
    phone: guest.phone ? formatPhone(guest.phone) : '',
    status: guest.status,
    table: guest.table ?? '',
  }
}

interface GuestFormPanelProps {
  eventId: string
  /** Guest to edit; omitted to add a new one. */
  guest?: AdminGuest
  /** Distinct groups of the event, offered as suggestions. */
  groups: string[]
  onDone: () => void
}

/**
 * Add / edit form for one guest (pass).
 *
 * @param props - Component props.
 * @param props.eventId - Event of the guest.
 * @param props.groups - Existing groups, for autocomplete.
 * @param props.guest - Guest being edited, if any.
 * @param props.onDone - Called after saving or cancelling.
 */
export function GuestFormPanel({
  eventId,
  groups,
  guest,
  onDone,
}: GuestFormPanelProps): ReactNode {
  const router = useRouter()
  const form = useForm<GuestFormInput, unknown, GuestFormData>({
    defaultValues: guest ? toInput(guest) : EMPTY,
    resolver: zodResolver(GuestForm),
  })
  const { control, formState, getValues, reset, setError } = form

  const onSubmit = form.handleSubmit(async () => {
    const values = getValues()
    const result = guest
      ? await updateGuest(guest.id, values)
      : await createGuest(eventId, values)
    if (!result.ok) {
      for (const [path, message] of Object.entries(result.fieldErrors ?? {})) {
        setError(path as FieldPath<GuestFormInput>, { message })
      }
      toast.error(result.error)
      return
    }
    toast.success(
      guest ? 'Invitado guardado' : `${values.displayName} agregado`
    )
    router.refresh()
    if (guest) onDone()
    else reset(EMPTY)
  })

  return (
    <FormProvider {...form}>
      <form
        className="flex flex-col gap-5 rounded-xl border bg-background p-4 sm:p-6"
        noValidate
        onSubmit={(event) => void onSubmit(event)}
      >
        <h2 className="text-lg font-semibold">
          {guest ? `Editar: ${guest.displayName}` : 'Agregar invitado'}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <GuestField
            className="lg:col-span-2"
            description="Como aparece en la invitación."
            label="Nombre"
            name="displayName"
            placeholder="Abraham y Ana"
          />
          <GuestField
            inputMode="numeric"
            label="Pases"
            min={1}
            name="maxPasses"
            type="number"
          />
          <GuestField label="Mesa (opcional)" name="table" placeholder="6" />
          <GuestField
            inputMode="numeric"
            label="Adultos (opcional)"
            min={0}
            name="adults"
            type="number"
          />
          <GuestField
            inputMode="numeric"
            label="Niños (opcional)"
            min={0}
            name="kids"
            type="number"
          />
          <GuestField
            autoComplete="off"
            label="Grupo (opcional)"
            list="guest-groups"
            name="group"
            placeholder="Familia novia"
          />
          <GuestField
            description="10 dígitos (México) o con +lada."
            inputMode="tel"
            label="WhatsApp (opcional)"
            name="phone"
            placeholder="55 1234 5678"
          />
          <div className="sm:col-span-2">
            <GuestField
              label="Mensaje personal (opcional)"
              multiline
              name="personalMessage"
            />
          </div>
          <div className="sm:col-span-2">
            <GuestField
              label="Notas internas (opcional)"
              multiline
              name="notes"
            />
          </div>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="guest-status">Estado del pase</FieldLabel>
                <Select
                  items={STATUS_OPTIONS}
                  onValueChange={(value) => field.onChange(value)}
                  value={field.value}
                >
                  <SelectTrigger className="w-full" id="guest-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_OPTIONS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        </div>
        <datalist id="guest-groups">
          {groups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </datalist>
        <div className="flex justify-end gap-2">
          <Button onClick={onDone} type="button" variant="ghost">
            {guest ? 'Cancelar' : 'Cerrar'}
          </Button>
          <Button disabled={formState.isSubmitting} type="submit">
            {formState.isSubmitting
              ? 'Guardando…'
              : guest
                ? 'Guardar'
                : 'Agregar'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
