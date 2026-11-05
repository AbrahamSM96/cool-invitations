import { Ornament } from '@/components/invitation/Ornament'
import type { ReactNode } from 'react'

import type { SectionProps } from '../types'

import { EnvelopeGate } from './EnvelopeGate'
import type { EnvelopeData } from './schema'

/**
 * Envelope overlay shown before the invitation. Rendered by the invitation
 * shell outside the scrolling content, so it covers the whole card.
 *
 * @param props - Section props.
 * @param props.data - Section content.
 * @param props.guest - Guest, when the invitation is personalized.
 * @param props.theme - Template theme.
 */
export function EnvelopeView({
  data,
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
    />
  )
}
