import { Ornament } from '@/components/invitation/Ornament'
import { formatEventDate } from '@/lib/dates'
import Image from 'next/image'
import type { ReactNode } from 'react'

import type { SectionProps } from '../types'

import type { HeroData } from './schema'

/**
 * Splits "Viridiana & Daniel" so the "&" can be drawn in the script font.
 *
 * @param name - Hosts display name.
 */
function splitNames(name: string): string[] {
  return name.split(/\s+&\s+|\s+y\s+/u)
}

/**
 * Opening screen. `classic`: stacked names on paper with a script "&".
 * `photo`: full-bleed photo with the name in script over a gradient.
 *
 * @param props - Section props.
 * @param props.data - Section content.
 * @param props.event - Event shown in the invitation.
 * @param props.theme - Template theme.
 * @param props.variant - `classic` (default) or `photo`.
 */
export function HeroView({
  data,
  event,
  theme,
  variant,
}: SectionProps<HeroData>): ReactNode {
  const shortDate = formatEventDate(event.startsAt, event.timezone, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).replaceAll('/', ' · ')
  const names = splitNames(event.hostsName)

  if (variant === 'photo' && data.imageUrl) {
    return (
      <section className="relative flex min-h-[92svh] flex-col items-center justify-end overflow-hidden px-6 pb-16 text-center text-white">
        <Image
          alt=""
          className="object-cover"
          fill
          preload
          sizes="(min-width: 768px) 430px, 100vw"
          src={data.imageUrl}
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/60" />
        <div className="relative flex flex-col items-center gap-3">
          <p className="font-caps text-xs tracking-[0.35em] uppercase">
            {event.title}
          </p>
          <h1 className="font-script text-7xl leading-none drop-shadow-md">
            {event.hostsName}
          </h1>
          <Ornament className="text-white/90" kind={theme.ornament} />
          <p className="font-caps text-sm tracking-[0.3em]">{shortDate}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="relative flex min-h-[80svh] flex-col items-center justify-center gap-5 overflow-hidden bg-inv-surface px-6 py-20 text-center">
      <div className="inv-texture absolute inset-0" />
      <div className="relative flex flex-col items-center gap-5">
        <Ornament kind={theme.ornament} />
        <p className="font-caps text-xs tracking-[0.35em] text-inv-muted">
          {shortDate}
        </p>
        <h1 className="flex flex-col items-center font-display text-6xl leading-[0.95] font-light">
          {names.map((name, index) => (
            <span className="flex flex-col items-center" key={name}>
              {index > 0 ? (
                <span className="font-script text-5xl leading-tight text-inv-accent">
                  &amp;
                </span>
              ) : null}
              {name}
            </span>
          ))}
        </h1>
        <p className="font-display text-xl text-inv-muted italic">
          {event.title}
        </p>
        <Ornament kind={theme.ornament} />
      </div>
    </section>
  )
}
