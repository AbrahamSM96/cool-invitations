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
import type { AdminSection } from '@/data/admin-sections'
import { sectionCatalog } from '@/sections/catalog'
import {
  describeSchema,
  stripEmpty,
  withFormDefaults,
} from '@/sections/form-fields'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { FormProvider, type Resolver, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import '@/lib/zod-es'

import { deleteSection, saveSection } from '../sections-actions'

import { ObjectFields } from './ObjectFields'

type Values = Record<string, unknown>

interface SectionFormProps {
  section: AdminSection
  /** Tells the list whether there are unsaved edits. */
  onDirtyChange: (dirty: boolean) => void
  onDeleted: () => void
}

/**
 * Edits one section: a form generated from its Zod schema, its layout and a
 * delete button. Validated in the browser and again on the server.
 *
 * @param props - Component props.
 * @param props.onDeleted - Called after the section is deleted.
 * @param props.onDirtyChange - Reports unsaved edits.
 * @param props.section - Section being edited.
 */
export function SectionForm({
  onDeleted,
  onDirtyChange,
  section,
}: SectionFormProps): ReactNode {
  const router = useRouter()
  const entry = sectionCatalog[section.type]
  const node = useMemo(() => describeSchema(entry.schema), [entry])
  const variants: readonly string[] = 'variants' in entry ? entry.variants : []
  const variantLabels: Record<string, string> =
    'variantLabels' in entry ? entry.variantLabels : {}

  const [variant, setVariant] = useState(section.variant ?? variants[0] ?? null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const form = useForm<Values>({
    defaultValues: withFormDefaults(node, section.data) as Values,
    // Same cleaning as the server before validating; the schema differs per
    // section type, so the form is typed loosely.
    resolver: zodResolver(
      z.preprocess(stripEmpty, entry.schema) as unknown as z.ZodType<
        Values,
        Values
      >
    ) as Resolver<Values>,
  })
  const { formState, getValues, reset, setError } = form
  const dirty =
    formState.isDirty || variant !== (section.variant ?? variants[0] ?? null)

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange])

  const onSubmit = form.handleSubmit(async () => {
    const result = await saveSection(section.id, {
      data: stripEmpty(getValues()),
      variant,
    })
    if (!result.ok) {
      for (const [path, message] of Object.entries(result.fieldErrors ?? {})) {
        setError(path, { message })
      }
      toast.error(result.error)
      return
    }
    reset(getValues())
    toast.success('Sección guardada')
    router.refresh()
  })

  /** Deletes the section after the second click. */
  async function remove(): Promise<void> {
    const result = await deleteSection(section.id)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('Sección borrada')
    onDeleted()
    router.refresh()
  }

  return (
    <FormProvider {...form}>
      <form
        className="flex flex-col gap-5"
        noValidate
        onSubmit={(event) => void onSubmit(event)}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">{entry.label}</h2>
          {confirmDelete ? (
            <div className="flex items-center gap-2 text-sm">
              ¿Borrar esta sección?
              <Button
                onClick={() => void remove()}
                size="sm"
                type="button"
                variant="destructive"
              >
                Sí, borrar
              </Button>
              <Button
                onClick={() => setConfirmDelete(false)}
                size="sm"
                type="button"
                variant="ghost"
              >
                No
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setConfirmDelete(true)}
              size="sm"
              type="button"
              variant="ghost"
            >
              Borrar
            </Button>
          )}
        </div>

        {variants.length > 1 ? (
          <Field>
            <FieldLabel htmlFor="section-variant">
              Diseño de la sección
            </FieldLabel>
            <Select
              items={variantLabels}
              onValueChange={(value) => {
                if (typeof value === 'string') setVariant(value)
              }}
              value={variant}
            >
              <SelectTrigger className="w-full" id="section-variant">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {variants.map((value) => (
                  <SelectItem key={value} value={value}>
                    {variantLabels[value] ?? value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ) : null}

        {node.kind === 'object' ? (
          <ObjectFields name="" node={node} variant={variant} />
        ) : null}

        <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t bg-background/90 px-4 py-3 backdrop-blur">
          {dirty ? (
            <span className="mr-auto text-sm text-muted-foreground">
              Cambios sin guardar
            </span>
          ) : null}
          <Button
            disabled={!dirty}
            onClick={() => {
              reset()
              setVariant(section.variant ?? variants[0] ?? null)
            }}
            type="button"
            variant="ghost"
          >
            Descartar
          </Button>
          <Button disabled={formState.isSubmitting} type="submit">
            {formState.isSubmitting ? 'Guardando…' : 'Guardar sección'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
