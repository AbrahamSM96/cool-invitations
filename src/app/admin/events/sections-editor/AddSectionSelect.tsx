'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { sectionCatalog } from '@/sections/catalog'
import type { ReactNode } from 'react'

const OPTIONS = Object.fromEntries(
  Object.entries(sectionCatalog)
    .map(([type, entry]) => [type, entry.label] as const)
    .toSorted((a, b) => a[1].localeCompare(b[1], 'es'))
)

/**
 * Dropdown to append a new section of the chosen type.
 *
 * @param props - Component props.
 * @param props.disabled - While a section is being added.
 * @param props.onAdd - Called with the chosen type.
 */
export function AddSectionSelect({
  disabled,
  onAdd,
}: {
  disabled: boolean
  onAdd: (type: string) => void
}): ReactNode {
  return (
    <Select
      disabled={disabled}
      items={OPTIONS}
      onValueChange={(value) => {
        if (typeof value === 'string') onAdd(value)
      }}
      value={null}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="+ Agregar sección" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(OPTIONS).map(([type, label]) => (
          <SelectItem key={type} value={type}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
