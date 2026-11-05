import { slugify } from '@/lib/slug'

import type { GuestFormInput } from '../schema'

/** Guest fields that can come from a spreadsheet column. */
export const IMPORT_FIELDS = {
  adults: 'Adultos',
  displayName: 'Nombre',
  group: 'Grupo',
  kids: 'Niños',
  maxPasses: 'Pases',
  notes: 'Notas internas',
  personalMessage: 'Mensaje personal',
  phone: 'WhatsApp',
  table: 'Mesa',
} as const

export type ImportField = keyof typeof IMPORT_FIELDS

/** Column index for each field; `null` = not in the file. */
export type ColumnMapping = Record<ImportField, number | null>

/** Header words that identify each field (compared as slugs). */
const ALIASES: Record<ImportField, string[]> = {
  adults: ['adultos', 'adulto', 'adults'],
  displayName: ['nombre', 'nombres', 'invitado', 'invitados', 'name'],
  group: ['grupo', 'categoria', 'group', 'lado'],
  kids: ['ninos', 'nino', 'menores', 'kids'],
  maxPasses: [
    'pases',
    'pase',
    'boletos',
    'lugares',
    'personas',
    'cantidad',
    'passes',
  ],
  notes: ['notas', 'nota', 'observaciones', 'notes'],
  personalMessage: ['mensaje', 'mensaje-personal', 'dedicatoria', 'message'],
  phone: ['telefono', 'tel', 'celular', 'whatsapp', 'movil', 'phone'],
  table: ['mesa', 'table', 'no-mesa', 'numero-de-mesa'],
}

/**
 * Tells whether a header matches an alias: the whole header, or one of its
 * words ("No. de pases" → `pases`). Multi-word aliases match as a phrase.
 *
 * @param slug - Header as a slug.
 * @param alias - Alias as a slug.
 * @param exact - Only accept the whole header.
 */
function matches(slug: string, alias: string, exact: boolean): boolean {
  if (slug === alias) return true
  if (exact) return false
  return alias.includes('-')
    ? slug.includes(alias)
    : slug.split('-').includes(alias)
}

/**
 * Guesses which column holds each field from the header row. Exact headers
 * win first ("Mesa"), then headers containing the word ("Número de mesa").
 *
 * @param headers - First row of the sheet.
 */
export function guessMapping(headers: string[]): ColumnMapping {
  const slugs = headers.map((header) => slugify(header))
  const mapping = Object.fromEntries(
    Object.keys(ALIASES).map((field) => [field, null])
  ) as ColumnMapping
  const used = new Set<number>()
  const fields = Object.entries(ALIASES) as [ImportField, string[]][]

  for (const exact of [true, false]) {
    for (const [field, aliases] of fields) {
      if (mapping[field] !== null) continue
      const index = slugs.findIndex(
        (slug, i) =>
          !used.has(i) && aliases.some((alias) => matches(slug, alias, exact))
      )
      if (index !== -1) {
        mapping[field] = index
        used.add(index)
      }
    }
  }
  return mapping
}

/**
 * Text of one field in a row, or `''` when the column is not mapped.
 *
 * @param row - Sheet row.
 * @param mapping - Column of each field.
 * @param field - Field to read.
 */
function cellOf(
  row: string[],
  mapping: ColumnMapping,
  field: ImportField
): string {
  const index = mapping[field]
  return index === null ? '' : (row[index] ?? '').trim()
}

/**
 * Builds guest form values from sheet rows. Rows without a name are
 * dropped (blank lines, totals). A missing pass count means 1.
 *
 * @param rows - Data rows (header excluded), as text.
 * @param mapping - Column of each field.
 */
export function rowsToGuests(
  rows: string[][],
  mapping: ColumnMapping
): { line: number; input: GuestFormInput }[] {
  return rows.flatMap((row, i) => {
    const displayName = cellOf(row, mapping, 'displayName')
    if (!displayName) return []
    return [
      {
        input: {
          adults: cellOf(row, mapping, 'adults'),
          displayName,
          group: cellOf(row, mapping, 'group'),
          kids: cellOf(row, mapping, 'kids'),
          maxPasses: cellOf(row, mapping, 'maxPasses') || 1,
          notes: cellOf(row, mapping, 'notes'),
          personalMessage: cellOf(row, mapping, 'personalMessage'),
          phone: cellOf(row, mapping, 'phone'),
          status: 'enabled',
          table: cellOf(row, mapping, 'table'),
        },
        // Spreadsheet line number: +1 for 1-based, +1 for the header row.
        line: i + 2,
      },
    ]
  })
}
