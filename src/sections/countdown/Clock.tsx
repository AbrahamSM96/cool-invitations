'use client'

import { type ReactNode, useSyncExternalStore } from 'react'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/**
 * Subscribes to a one-second tick.
 *
 * @param onTick - Called every second.
 */
function subscribe(onTick: () => void): () => void {
  const id = setInterval(onTick, SECOND)
  return (): void => clearInterval(id)
}

/**
 * Current time rounded to the second, so React only re-renders once per tick.
 */
function getNow(): number {
  return Math.floor(Date.now() / SECOND) * SECOND
}

/**
 * The server never knows the visitor's clock: render placeholders until hydration.
 */
function getServerNow(): null {
  return null
}

interface ClockProps {
  /** Event start as epoch milliseconds. */
  target: number
  afterText: string
}

/**
 * Live days / hours / minutes / seconds until the event.
 *
 * @param props - Clock props.
 * @param props.afterText - Shown once the event has started.
 * @param props.target - Event start as epoch milliseconds.
 */
export function Clock({ afterText, target }: ClockProps): ReactNode {
  const now = useSyncExternalStore(subscribe, getNow, getServerNow)
  const remaining = now === null ? null : target - now

  if (remaining !== null && remaining <= 0) {
    return <p className="font-display text-3xl text-inv-accent">{afterText}</p>
  }

  const units = [
    {
      label: 'Días',
      value: remaining === null ? null : Math.floor(remaining / DAY),
    },
    {
      label: 'Horas',
      value: remaining === null ? null : Math.floor((remaining % DAY) / HOUR),
    },
    {
      label: 'Min',
      value:
        remaining === null ? null : Math.floor((remaining % HOUR) / MINUTE),
    },
    {
      label: 'Seg',
      value:
        remaining === null ? null : Math.floor((remaining % MINUTE) / SECOND),
    },
  ]

  return (
    <dl className="grid w-full max-w-xs grid-cols-4 divide-x divide-inv-muted/30 border-y border-inv-muted/30 py-4">
      {units.map((unit) => (
        <div className="flex flex-col items-center gap-1" key={unit.label}>
          <dd className="font-display text-4xl font-light tabular-nums">
            {unit.value === null ? '--' : String(unit.value).padStart(2, '0')}
          </dd>
          <dt className="font-caps text-[10px] tracking-[0.25em] text-inv-accent uppercase">
            {unit.label}
          </dt>
        </div>
      ))}
    </dl>
  )
}
