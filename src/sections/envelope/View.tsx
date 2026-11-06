import { Ornament } from '@/components/invitation/Ornament'
import type { ReactNode } from 'react'

import type { SectionProps } from '../types'

import { EnvelopeGate } from './EnvelopeGate'
import type { EnvelopeData } from './schema'

/**
 * Initials for the seal: "Viridiana & Daniel" → "V&D", "Camila" → "C".
 *
 * @param hostsName - Names shown on the invitation.
 */
function monogramOf(hostsName: string): string {
  return hostsName
    .split(/\s*&\s*|\s+y\s+/i)
    .map((name) => name.trim().charAt(0).toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join('&')
}

/**
 * Envelope overlay shown before the invitation. Rendered by the invitation
 * shell outside the scrolling content, so it covers the whole card.
 *
 * @param props - Section props.
 * @param props.data - Section content.
 * @param props.event - Event shown in the invitation (names for the seal).
 * @param props.guest - Guest, when the invitation is personalized.
 * @param props.theme - Template theme.
 */
export function EnvelopeView({
  data,
  event,
  guest,
  theme,
}: SectionProps<EnvelopeData>): ReactNode {
  return (
    <EnvelopeGate
      decoration={
        <Ornament className="text-(--inv-envelope-ink)" kind={theme.ornament} />
      }
      guestName={guest?.displayName ?? null}
      hint={data.hint}
      monogram={monogramOf(event.hostsName)}
    />
  )
}
