'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { type EventType, eventTypes } from '@/event-types'
import { templates } from '@/templates/registry'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { type ReactNode, useEffect } from 'react'
import {
  type FieldPath,
  FormProvider,
  useForm,
  useWatch,
} from 'react-hook-form'
import { toast } from 'sonner'

import { STATUS_LABELS, TIME_ZONES, VOICE_LABELS } from '../labels'
import {
  type EventActionResult,
  EventForm,
  type EventFormData,
  type EventFormInput,
} from '../schema'

import { emptyHosts, NEW_EVENT, suggestSlug } from './defaults'
import { HostsFields } from './HostsFields'
import { PlacesFields } from './PlacesFields'
import { SelectField } from './SelectField'
import { TextField } from './TextField'

const TYPE_OPTIONS = Object.fromEntries(
  Object.entries(eventTypes).map(([type, config]) => [type, config.label])
)
const TEMPLATE_OPTIONS = Object.fromEntries(
  Object.values(templates).map((template) => [template.key, template.name])
)

interface EventFormViewProps {
  /** Server Action that validates and saves the values. */
  action: (input: unknown) => Promise<EventActionResult>
  /** Saved values when editing; omitted for a new event. */
  initialValues?: EventFormInput
}

/**
 * Create / edit form for an event's base data. Validated in the browser and
 * again on the server with the same schema.
 *
 * @param props - Form props.
 * @param props.action - Save action.
 * @param props.initialValues - Saved values, when editing.
 */
export function EventFormView({
  action,
  initialValues,
}: EventFormViewProps): ReactNode {
  const router = useRouter()
  const isNew = !initialValues
  const form = useForm<EventFormInput, unknown, EventFormData>({
    defaultValues: initialValues ?? NEW_EVENT,
    resolver: zodResolver(EventForm),
  })
  const { control, formState, getFieldState, getValues, setError, setValue } =
    form

  // New events: keep the slug in step with the names until it is edited.
  const title = useWatch({ control, name: 'title' })
  const hosts = useWatch({ control, name: 'hosts' })
  useEffect(() => {
    if (!isNew || getFieldState('slug').isDirty) return
    setValue('slug', suggestSlug(getValues()))
  }, [getFieldState, getValues, hosts, isNew, setValue, title])

  /**
   * Switches the event type, resetting the fields that depend on it.
   *
   * @param value - New type.
   */
  function changeType(value: string): void {
    const type = value as EventType
    setValue('type', type, { shouldDirty: true })
    setValue('hosts', emptyHosts(type), { shouldDirty: true })
    setValue('voice', eventTypes[type].voice, { shouldDirty: true })
  }

  // Sends the raw values: the server parses them with the same schema.
  const onSubmit = form.handleSubmit(async () => {
    const result = await action(getValues())
    if (!result.ok) {
      for (const [path, message] of Object.entries(result.fieldErrors ?? {})) {
        setError(path as FieldPath<EventFormInput>, { message })
      }
      toast.error(result.error)
      return
    }
    if (isNew) {
      toast.success('Evento creado')
      // Next keeps visited pages mounted (Activity), so "Nuevo evento" would
      // reopen with these values: empty it before leaving.
      form.reset(NEW_EVENT)
      router.push(`/admin/events/${result.id}`)
    } else {
      toast.success('Cambios guardados')
      form.reset(getValues())
      router.refresh()
    }
  })

  return (
    <FormProvider {...form}>
      <form
        className="flex flex-col gap-6"
        noValidate
        onSubmit={(event) => void onSubmit(event)}
      >
        <Card>
          <CardHeader>
            <CardTitle>Proyecto</CardTitle>
            <CardDescription>
              Datos internos, no los ven los invitados.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Nombre del evento"
              name="title"
              placeholder="Boda Viridiana y Daniel"
            />
            <TextField
              label="Cliente"
              name="clientName"
              placeholder="Viridiana López"
            />
            <SelectField
              label="Tipo de evento"
              name="type"
              onSelect={changeType}
              options={TYPE_OPTIONS}
            />
            <SelectField
              label="Diseño"
              name="templateKey"
              options={TEMPLATE_OPTIONS}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Protagonistas</CardTitle>
            <CardDescription>
              Los nombres que aparecen en la invitación.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <HostsFields />
            <SelectField
              label="Cómo hablan los textos"
              name="voice"
              options={VOICE_LABELS}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fecha y hora</CardTitle>
            <CardDescription>
              Cuándo empieza, en la hora local del lugar del evento.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Fecha y hora"
              name="startsAt"
              type="datetime-local"
            />
            <SelectField
              label="Zona horaria"
              name="timezone"
              options={TIME_ZONES}
            />
            <TextField
              description="Opcional. Después de esta fecha ya no se puede confirmar."
              label="Fecha límite para confirmar"
              name="rsvpDeadline"
              type="datetime-local"
            />
            <TextField
              description="Opcional. Texto corto del cierre, ej. 14.11.2026 · Guadalajara."
              label="Ciudad"
              name="cityLabel"
              placeholder="Guadalajara, Jalisco"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lugares</CardTitle>
            <CardDescription>
              Dónde es el evento. Al guardar se ponen solos en las secciones
              "Lugar" vacías, en el mismo orden.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PlacesFields />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publicación</CardTitle>
            <CardDescription>
              Link público de la invitación y si ya se puede ver.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <TextField
              autoCapitalize="none"
              description="/e/… · minúsculas, números y guiones."
              label="Link"
              name="slug"
              placeholder="viridiana-y-daniel"
            />
            <SelectField label="Estado" name="status" options={STATUS_LABELS} />
          </CardContent>
        </Card>

        <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t bg-background/90 px-4 py-3 backdrop-blur">
          <Button
            onClick={() => {
              // Cancel discards: the next visit starts from the saved values.
              form.reset()
              router.push('/admin')
            }}
            type="button"
            variant="ghost"
          >
            Cancelar
          </Button>
          <Button disabled={formState.isSubmitting} type="submit">
            {formState.isSubmitting
              ? 'Guardando…'
              : isNew
                ? 'Crear evento'
                : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
