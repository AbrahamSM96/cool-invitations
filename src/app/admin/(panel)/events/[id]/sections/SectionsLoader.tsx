import { SectionsEditor } from '@/app/admin/events/sections-editor/SectionsEditor'
import { isEventId } from '@/data/admin-events'
import { getAdminSections } from '@/data/admin-sections'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

/**
 * Loads the event's sections and renders the editor.
 *
 * @param props - Component props.
 * @param props.params - Route params (`id`).
 */
export async function SectionsLoader({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<ReactNode> {
  const { id } = await params
  if (!isEventId(id)) notFound()
  const page = await getAdminSections(id)
  if (!page) notFound()
  return <SectionsEditor eventId={id} sections={page.sections} />
}
