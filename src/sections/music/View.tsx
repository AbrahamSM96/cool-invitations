import type { ReactNode } from 'react'

import type { SectionProps } from '../types'

import { MusicButton } from './MusicButton'
import type { MusicData } from './schema'

/**
 * Background music. Rendered by the invitation shell as a floating button.
 *
 * @param props - Section props.
 * @param props.data - Section content.
 */
export function MusicView({ data }: SectionProps<MusicData>): ReactNode {
  return <MusicButton url={data.url} />
}
