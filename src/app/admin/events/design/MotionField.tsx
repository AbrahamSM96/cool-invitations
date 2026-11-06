'use client'

import { cn } from '@/lib/utils'
import { type Motion, MOTION_PRESETS } from '@/templates/types'
import type { ReactNode } from 'react'

const OPTIONS: Record<Motion, { label: string; description: string }> = {
  expressive: {
    description:
      'Listas en cascada, fotos que se abren como ventana, portada con efecto de profundidad.',
    label: 'Expresivo',
  },
  none: {
    description: 'Todo aparece quieto.',
    label: 'Ninguno',
  },
  soft: {
    description: 'Cada sección sube suavemente al aparecer.',
    label: 'Suave',
  },
}

/**
 * Picks the scroll animation preset of the invitation.
 *
 * @param props - Component props.
 * @param props.onChange - Called with the chosen preset.
 * @param props.value - Current preset.
 */
export function MotionField({
  onChange,
  value,
}: {
  value: Motion
  onChange: (motion: Motion) => void
}): ReactNode {
  return (
    <fieldset className="grid gap-2 sm:grid-cols-3">
      <legend className="sr-only">Movimiento</legend>
      {MOTION_PRESETS.map((preset) => (
        <label
          className={cn(
            'flex cursor-pointer flex-col gap-1 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50',
            value === preset &&
              'border-foreground/50 bg-muted ring-2 ring-foreground/10'
          )}
          key={preset}
        >
          <span className="flex items-center gap-2 font-medium">
            <input
              checked={value === preset}
              className="accent-primary"
              name="motion"
              onChange={() => onChange(preset)}
              type="radio"
            />
            {OPTIONS[preset].label}
          </span>
          <span className="text-xs text-muted-foreground">
            {OPTIONS[preset].description}
          </span>
        </label>
      ))}
    </fieldset>
  )
}
