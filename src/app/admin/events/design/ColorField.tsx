'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { RotateCcwIcon, TriangleAlertIcon } from 'lucide-react'
import { type ReactNode, useId, useState } from 'react'

interface ColorFieldProps {
  label: string
  hint: string
  /** Effective color (event change, or the template's). */
  value: string
  /** The event changed it. */
  changed: boolean
  warnings?: string[]
  onChange: (hex: string | undefined) => void
}

/**
 * One theme color: picker, hex text, "back to template" and contrast
 * warnings.
 *
 * @param props - Component props.
 * @param props.changed - The event overrides it.
 * @param props.hint - Where the color is used.
 * @param props.label - Color name.
 * @param props.onChange - New hex, or `undefined` to use the template's.
 * @param props.value - Current color.
 * @param props.warnings - Readability problems.
 */
export function ColorField({
  changed,
  hint,
  label,
  onChange,
  value,
  warnings = [],
}: ColorFieldProps): ReactNode {
  const id = useId()
  // Free typing; only valid hex values reach the design.
  const [draft, setDraft] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <input
          aria-label={`${label}: elegir color`}
          className="h-8 w-10 cursor-pointer rounded border bg-transparent p-0.5"
          onChange={(event) =>
            onChange(event.currentTarget.value.toUpperCase())
          }
          type="color"
          value={value}
        />
        <label className="min-w-0 flex-1" htmlFor={id}>
          <span className="block text-sm font-medium">
            {label}
            {changed ? null : (
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                · plantilla
              </span>
            )}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {hint}
          </span>
        </label>
        <Input
          className={cn(
            'h-8 w-24 font-mono text-xs uppercase',
            warnings.length > 0 && 'border-amber-500'
          )}
          id={id}
          maxLength={7}
          onBlur={() => setDraft(null)}
          onChange={(event) => {
            const text = event.currentTarget.value
            setDraft(text)
            if (/^#[0-9a-fA-F]{6}$/.test(text)) onChange(text.toUpperCase())
          }}
          value={draft ?? value}
        />
        <Button
          aria-label={`${label}: volver al de la plantilla`}
          disabled={!changed}
          onClick={() => onChange(undefined)}
          size="icon-sm"
          title="Volver al de la plantilla"
          type="button"
          variant="ghost"
        >
          <RotateCcwIcon />
        </Button>
      </div>
      {warnings.map((warning) => (
        <p
          className="flex items-start gap-1 pl-12 text-xs text-amber-700 dark:text-amber-400"
          key={warning}
        >
          <TriangleAlertIcon className="mt-0.5 size-3 shrink-0" />
          {warning}
        </p>
      ))}
    </div>
  )
}
