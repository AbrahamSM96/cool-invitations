'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ReactNode } from 'react'

const NONE = 'none'

/**
 * Picks which spreadsheet column feeds one guest field.
 *
 * @param props - Component props.
 * @param props.headers - Column headers of the file.
 * @param props.label - Guest field name.
 * @param props.onChange - Called with the column index, or `null`.
 * @param props.value - Current column index, or `null`.
 */
export function MappingSelect({
  headers,
  label,
  onChange,
  value,
}: {
  headers: string[]
  label: string
  value: number | null
  onChange: (index: number | null) => void
}): ReactNode {
  const items: Record<string, string> = {
    [NONE]: '— No está en el archivo —',
    ...Object.fromEntries(
      headers.map((header, i) => [String(i), header || `Columna ${i + 1}`])
    ),
  }
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <Select
        items={items}
        onValueChange={(next) => {
          if (typeof next !== 'string') return
          onChange(next === NONE ? null : Number(next))
        }}
        value={value === null ? NONE : String(value)}
      >
        <SelectTrigger className="w-full" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(items).map(([key, text]) => (
            <SelectItem key={key} value={key}>
              {text}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  )
}
