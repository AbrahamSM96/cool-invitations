import { read, utils } from 'xlsx'

export interface Sheet {
  headers: string[]
  rows: string[][]
}

/** Biggest file accepted, so a wrong file cannot freeze the tab. */
const MAX_BYTES = 5 * 1024 * 1024

/**
 * Reads the first sheet of an Excel or CSV file as text cells. Runs in the
 * browser: the file never leaves the computer, only the parsed guests do.
 *
 * @param file - `.xlsx`, `.xls` or `.csv` file.
 */
export async function readSheet(file: File): Promise<Sheet> {
  if (file.size > MAX_BYTES) throw new Error('El archivo pesa más de 5 MB.')
  const workbook = read(await file.arrayBuffer(), {
    dense: true,
    type: 'array',
  })
  const firstName = workbook.SheetNames[0]
  const sheet = firstName ? workbook.Sheets[firstName] : undefined
  if (!sheet) throw new Error('El archivo no tiene hojas.')

  // `raw: false` returns cells as shown in Excel ("6", not 6.0000001).
  const table = utils.sheet_to_json<unknown[]>(sheet, {
    blankrows: false,
    defval: '',
    header: 1,
    raw: false,
  })
  const [headerRow = [], ...rows] = table.map((row) =>
    row.map((value) =>
      typeof value === 'string'
        ? value
        : typeof value === 'number' || typeof value === 'boolean'
          ? String(value)
          : ''
    )
  )
  return { headers: headerRow, rows }
}
