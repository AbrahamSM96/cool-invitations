'use client'

import { Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FONT_OPTIONS, type FontKey } from '@/templates/font-options'
import type { ReactNode } from 'react'

const TEMPLATE = 'template'

/**
 * Picks the font of one theme slot, or keeps the template's. Each option
 * is shown in its own typeface.
 *
 * @param props - Component props.
 * @param props.label - Slot name.
 * @param props.onChange - New font, or `undefined` for the template's.
 * @param props.templateFont - Font the template uses here.
 * @param props.value - Event's choice, if any.
 */
export function FontField({
  label,
  onChange,
  templateFont,
  value,
}: {
  label: string
  value: FontKey | undefined
  templateFont: FontKey | null
  onChange: (key: FontKey | undefined) => void
}): ReactNode {
  const items: Record<string, string> = {
    [TEMPLATE]: `Plantilla${templateFont ? `: ${FONT_OPTIONS[templateFont].label}` : ''}`,
    ...Object.fromEntries(
      Object.entries(FONT_OPTIONS).map(([key, font]) => [key, font.label])
    ),
  }
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Select
        items={items}
        onValueChange={(next) => {
          if (typeof next !== 'string') return
          onChange(next === TEMPLATE ? undefined : (next as FontKey))
        }}
        value={value ?? TEMPLATE}
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(items).map(([key, text]) => (
            <SelectItem key={key} value={key}>
              <span
                style={
                  key === TEMPLATE
                    ? undefined
                    : { fontFamily: FONT_OPTIONS[key as FontKey].css }
                }
              >
                {text}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}
