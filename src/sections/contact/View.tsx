import { SectionFrame } from '@/components/invitation/SectionFrame'
import { SectionHeading } from '@/components/invitation/SectionHeading'
import { normalizePhone } from '@/lib/phone'
import type { ReactNode } from 'react'

import type { SectionProps } from '../types'

import type { ContactData } from './schema'

/**
 * People guests can write to on WhatsApp (planner, family...).
 *
 * @param props - Section props.
 * @param props.data - Section content.
 */
export function ContactView({ data }: SectionProps<ContactData>): ReactNode {
  return (
    <SectionFrame tone={data.tone}>
      <SectionHeading title={data.title} />
      {data.text ? (
        <p className="max-w-72 text-sm leading-relaxed text-inv-muted">
          {data.text}
        </p>
      ) : null}
      <ul className="inv-stagger mt-2 flex w-full max-w-72 flex-col gap-3">
        {data.contacts.map((contact) => {
          const phone = normalizePhone(contact.phone)
          return (
            <li key={`${contact.name}-${contact.phone}`}>
              <a
                className="flex flex-col items-center gap-0.5 border border-inv-primary px-5 py-3"
                href={phone ? `https://wa.me/${phone}` : undefined}
                rel="noreferrer"
                target="_blank"
              >
                <span className="font-display text-xl">{contact.name}</span>
                {contact.role ? (
                  <span className="font-caps text-[10px] tracking-[0.2em] text-inv-muted uppercase">
                    {contact.role}
                  </span>
                ) : null}
                <span className="mt-1 font-caps text-[10px] tracking-[0.25em] text-inv-accent uppercase">
                  Escribir por WhatsApp
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </SectionFrame>
  )
}
