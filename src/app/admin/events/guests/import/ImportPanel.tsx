'use client'

import { Button } from '@/components/ui/button'
import { FileSpreadsheetIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type ReactNode, useId, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { importGuests } from '../actions'
import { GuestForm } from '../schema'

import {
  type ColumnMapping,
  guessMapping,
  IMPORT_FIELDS,
  type ImportField,
  rowsToGuests,
} from './columns'
import { MappingSelect } from './MappingSelect'
import { readSheet, type Sheet } from './read-sheet'
import { downloadTemplate } from './template'

const PREVIEW_ROWS = 8

/**
 * Imports guests from an Excel or CSV file: read in the browser, columns
 * guessed and adjustable, every row checked before sending.
 *
 * @param props - Component props.
 * @param props.eventId - Event to import into.
 * @param props.onClose - Called when the panel closes.
 */
export function ImportPanel({
  eventId,
  onClose,
}: {
  eventId: string
  onClose: () => void
}): ReactNode {
  const router = useRouter()
  const inputId = useId()
  const [file, setFile] = useState<{ name: string; sheet: Sheet } | null>(null)
  const [mapping, setMapping] = useState<ColumnMapping | null>(null)
  const [skipExisting, setSkipExisting] = useState(true)
  const [importing, startImport] = useTransition()

  const guests = file && mapping ? rowsToGuests(file.sheet.rows, mapping) : []
  const checked = guests.map((guest) => ({
    ...guest,
    result: GuestForm.safeParse(guest.input),
  }))
  const valid = checked.filter((row) => row.result.success).length
  const invalid = checked.filter((row) => !row.result.success)

  /**
   * Reads the picked file and guesses its columns.
   *
   * @param picked - File from the input.
   */
  async function load(picked: File): Promise<void> {
    try {
      const sheet = await readSheet(picked)
      setFile({ name: picked.name, sheet })
      setMapping(guessMapping(sheet.headers))
    } catch (error) {
      toast.error(
        error instanceof Error && error.message.startsWith('El archivo')
          ? error.message
          : 'No se pudo leer el archivo. Usa Excel (.xlsx) o CSV.'
      )
    }
  }

  /** Sends the rows to the server and reports what happened. */
  function submit(): void {
    startImport(async () => {
      const result = await importGuests(eventId, guests, { skipExisting })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      const parts = [`${result.created} invitados importados`]
      if (result.skipped) parts.push(`${result.skipped} ya existían`)
      if (result.errors.length)
        parts.push(`${result.errors.length} con errores`)
      toast.success(parts.join(' · '))
      router.refresh()
      onClose()
    })
  }

  return (
    <div className="flex flex-col gap-5 rounded-xl border bg-background p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Importar de Excel o CSV</h2>
        <Button
          onClick={downloadTemplate}
          size="sm"
          type="button"
          variant="ghost"
        >
          Descargar plantilla
        </Button>
      </div>

      <label
        className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-8 text-center text-sm text-muted-foreground hover:bg-muted/50"
        htmlFor={inputId}
      >
        <FileSpreadsheetIcon className="size-8" />
        {file ? (
          <span>
            <span className="font-medium text-foreground">{file.name}</span> ·{' '}
            {file.sheet.rows.length} renglones · elegir otro
          </span>
        ) : (
          <span>
            Elige un archivo .xlsx, .xls o .csv. La primera fila deben ser los
            encabezados.
          </span>
        )}
      </label>
      <input
        accept=".xlsx,.xls,.csv"
        className="sr-only"
        id={inputId}
        onChange={(event) => {
          const input = event.currentTarget
          const picked = input.files?.[0]
          input.value = ''
          if (picked) void load(picked)
        }}
        type="file"
      />

      {file && mapping ? (
        <>
          <div>
            <h3 className="mb-2 text-sm font-medium">
              ¿Qué columna es cada dato?
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {(Object.keys(IMPORT_FIELDS) as ImportField[]).map((field) => (
                <MappingSelect
                  headers={file.sheet.headers}
                  key={field}
                  label={IMPORT_FIELDS[field]}
                  onChange={(index) =>
                    setMapping({ ...mapping, [field]: index })
                  }
                  value={mapping[field]}
                />
              ))}
            </div>
          </div>

          {mapping.displayName === null ? (
            <p className="text-sm text-destructive">
              Elige la columna del nombre para continuar.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Línea</th>
                      <th className="px-3 py-2">Nombre</th>
                      <th className="px-3 py-2">Pases</th>
                      <th className="px-3 py-2">Mesa</th>
                      <th className="px-3 py-2">WhatsApp</th>
                      <th className="px-3 py-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checked.slice(0, PREVIEW_ROWS).map((row) => (
                      <tr className="border-t" key={row.line}>
                        <td className="px-3 py-2 text-muted-foreground">
                          {row.line}
                        </td>
                        <td className="px-3 py-2">{row.input.displayName}</td>
                        <td className="px-3 py-2">
                          {String(row.input.maxPasses)}
                        </td>
                        <td className="px-3 py-2">
                          {String(row.input.table ?? '')}
                        </td>
                        <td className="px-3 py-2">
                          {String(row.input.phone ?? '')}
                        </td>
                        <td className="px-3 py-2">
                          {row.result.success ? (
                            <span className="text-emerald-600">Listo</span>
                          ) : (
                            <span className="text-destructive">
                              {row.result.error.issues[0]?.message}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {checked.length > PREVIEW_ROWS ? (
                  <p className="border-t px-3 py-2 text-xs text-muted-foreground">
                    …y {checked.length - PREVIEW_ROWS} más.
                  </p>
                ) : null}
              </div>

              {invalid.length > 0 ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
                  <p className="font-medium">
                    {invalid.length} renglones con errores no se importarán:
                  </p>
                  <ul className="mt-1 list-disc pl-5 text-muted-foreground">
                    {invalid.slice(0, 10).map((row) => (
                      <li key={row.line}>
                        Línea {row.line} ({row.input.displayName}):{' '}
                        {!row.result.success &&
                          row.result.error.issues[0]?.message}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Corrígelos en el archivo y vuelve a elegirlo, o agrégalos a
                    mano después.
                  </p>
                </div>
              ) : null}

              <label className="flex items-center gap-2 text-sm">
                <input
                  checked={skipExisting}
                  className="size-4 accent-primary"
                  onChange={(event) =>
                    setSkipExisting(event.currentTarget.checked)
                  }
                  type="checkbox"
                />
                Saltar nombres que ya están en la lista
              </label>
            </>
          )}
        </>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button onClick={onClose} type="button" variant="ghost">
          Cancelar
        </Button>
        <Button
          disabled={importing || valid === 0 || mapping?.displayName === null}
          onClick={submit}
          type="button"
        >
          {importing ? 'Importando…' : `Importar ${valid} invitados`}
        </Button>
      </div>
    </div>
  )
}
