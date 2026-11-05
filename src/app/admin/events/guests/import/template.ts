import { utils, writeFile } from 'xlsx'

/** Downloads an empty spreadsheet with the columns the importer knows. */
export function downloadTemplate(): void {
  const sheet = utils.aoa_to_sheet([
    [
      'Nombre',
      'Pases',
      'Mesa',
      'WhatsApp',
      'Grupo',
      'Adultos',
      'Niños',
      'Mensaje personal',
    ],
    ['Abraham y Ana', 2, 6, '55 1234 5678', 'Familia novia', 2, 0, ''],
    ['Familia Pérez', 4, 3, '33 3615 0000', 'Amigos', 2, 2, ''],
  ])
  sheet['!cols'] = [
    { wch: 24 },
    { wch: 6 },
    { wch: 6 },
    { wch: 14 },
    { wch: 16 },
  ]
  const book = utils.book_new()
  utils.book_append_sheet(book, sheet, 'Invitados')
  writeFile(book, 'plantilla-invitados.xlsx')
}
