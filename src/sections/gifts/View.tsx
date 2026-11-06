import { SectionFrame } from '@/components/invitation/SectionFrame'
import { SectionHeading } from '@/components/invitation/SectionHeading'
import type { ReactNode } from 'react'

import type { SectionProps } from '../types'

import { CopyButton } from './CopyButton'
import type { GiftsData } from './schema'

/**
 * Gift registry: intro text, bank accounts with copy buttons and links.
 *
 * @param props - Section props.
 * @param props.data - Section content.
 */
export function GiftsView({ data }: SectionProps<GiftsData>): ReactNode {
  return (
    <SectionFrame tone={data.tone}>
      <SectionHeading eyebrow={data.eyebrow} />
      {data.title ? (
        <p className="font-display text-2xl">{data.title}</p>
      ) : null}
      {data.text ? (
        <p className="max-w-sm leading-relaxed">{data.text}</p>
      ) : null}
      {data.accounts.length > 0 ? (
        <ul className="inv-stagger mt-2 flex w-full flex-col gap-3">
          {data.accounts.map((account) => (
            <li
              className="flex items-center gap-3 border border-inv-muted/25 bg-inv-card px-4 py-3 text-left"
              key={account.number}
            >
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="font-caps text-[10px] tracking-[0.25em] text-inv-accent uppercase">
                  {account.bank}
                </span>
                <span className="font-display text-lg tracking-wide tabular-nums">
                  {account.number}
                </span>
                {account.holder ? (
                  <span className="truncate text-xs text-inv-muted">
                    {account.holder}
                  </span>
                ) : null}
              </div>
              <CopyButton
                label={`Copiar número de ${account.bank}`}
                value={account.number}
              />
            </li>
          ))}
        </ul>
      ) : null}
      {data.links.length > 0 ? (
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {data.links.map((link) => (
            <a
              className="border border-inv-primary px-4 py-2 font-caps text-[11px] tracking-[0.2em] text-inv-primary uppercase"
              href={link.url}
              key={link.url}
              rel="noreferrer"
              target="_blank"
            >
              {link.label}
            </a>
          ))}
        </div>
      ) : null}
    </SectionFrame>
  )
}
