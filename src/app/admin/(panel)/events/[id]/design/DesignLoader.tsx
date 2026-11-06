import { DesignEditor } from '@/app/admin/events/design/DesignEditor'
import { getAdminDesign } from '@/data/admin-design'
import { isEventId } from '@/data/admin-events'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

/**
 * Loads the template and the event's design changes.
 *
 * @param props - Component props.
 * @param props.params - Route params (`id`).
 */
export async function DesignLoader({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<ReactNode> {
  const { id } = await params
  if (!isEventId(id)) notFound()
  const design = await getAdminDesign(id)
  if (!design) notFound()
  return (
    <DesignEditor
      baseTheme={design.baseTheme}
      eventId={id}
      initial={design.overrides}
      templateName={design.templateName}
    />
  )
}
