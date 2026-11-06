import type { ReactNode } from 'react'

import { TabLinks } from './TabLinks'

/**
 * Builds the tab links for an event.
 *
 * @param props - Component props.
 * @param props.params - Route params (`id`).
 */
export async function EventTabs({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<ReactNode> {
  const { id } = await params
  const base = `/admin/events/${id}`
  return (
    <TabLinks
      tabs={[
        { href: base, label: 'Datos' },
        { href: `${base}/design`, label: 'Diseño' },
        { href: `${base}/sections`, label: 'Secciones' },
        { href: `${base}/guests`, label: 'Invitados' },
        { href: `${base}/responses`, label: 'Respuestas' },
      ]}
    />
  )
}
