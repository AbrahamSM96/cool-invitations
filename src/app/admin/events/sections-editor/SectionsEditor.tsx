'use client'

import type { AdminSection } from '@/data/admin-sections'
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useRouter } from 'next/navigation'
import { type ReactNode, useCallback, useState, useTransition } from 'react'
import { toast } from 'sonner'

import {
  addSection,
  reorderSections,
  setSectionEnabled,
} from '../sections-actions'

import { AddSectionSelect } from './AddSectionSelect'
import { EditorEventContext } from './EditorContext'
import { SectionForm } from './SectionForm'
import { SortableSectionItem } from './SortableSectionItem'

interface SectionsEditorProps {
  eventId: string
  sections: AdminSection[]
}

/**
 * Two-pane section editor: sortable list on the left, the selected
 * section's form on the right. Order and visibility save immediately.
 *
 * @param props - Component props.
 * @param props.eventId - Event being edited.
 * @param props.sections - Saved sections, in order.
 */
export function SectionsEditor({
  eventId,
  sections,
}: SectionsEditorProps): ReactNode {
  const router = useRouter()
  const [order, setOrder] = useState(() => sections.map((s) => s.id))
  const [synced, setSynced] = useState(sections)
  const [selectedId, setSelectedId] = useState<string | null>(
    sections[0]?.id ?? null
  )
  const [dirty, setDirty] = useState(false)
  const [adding, startAdding] = useTransition()

  // New data from the server (save, add, delete): adopt its order.
  if (synced !== sections) {
    setSynced(sections)
    setOrder(sections.map((s) => s.id))
  }

  const byId = new Map(sections.map((s) => [s.id, s]))
  const ordered = order.flatMap((id) => byId.get(id) ?? [])
  const selected = selectedId ? byId.get(selectedId) : undefined

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  /**
   * Moves a section and saves the order; restores it if saving fails.
   *
   * @param event - Drop event from dnd-kit.
   */
  async function onDragEnd(event: DragEndEvent): Promise<void> {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const previous = order
    const next = arrayMove(
      order,
      order.indexOf(String(active.id)),
      order.indexOf(String(over.id))
    )
    setOrder(next)
    const result = await reorderSections(eventId, next)
    if (!result.ok) {
      setOrder(previous)
      toast.error(result.error)
    }
  }

  /**
   * Shows or hides a section in the invitation.
   *
   * @param section - Section to toggle.
   */
  async function toggle(section: AdminSection): Promise<void> {
    const result = await setSectionEnabled(section.id, !section.enabled)
    if (!result.ok) toast.error(result.error)
    router.refresh()
  }

  /**
   * Drops the unsaved edits and opens another section.
   *
   * @param id - Section to open.
   */
  function discardAndOpen(id: string): void {
    setDirty(false)
    setSelectedId(id)
  }

  /**
   * Opens a section, unless the open one has unsaved edits.
   *
   * @param id - Section to open.
   */
  function select(id: string): void {
    if (id === selectedId) return
    if (dirty) {
      toast.warning('Tienes cambios sin guardar en esta sección.', {
        action: {
          label: 'Descartar',
          onClick: discardAndOpen.bind(null, id),
        },
      })
      return
    }
    setSelectedId(id)
  }

  /**
   * Appends a section and opens it.
   *
   * @param type - Section type.
   */
  function add(type: string): void {
    startAdding(async () => {
      const result = await addSection(eventId, type)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setDirty(false)
      if (result.id) setSelectedId(result.id)
      router.refresh()
    })
  }

  const onDirtyChange = useCallback((value: boolean) => setDirty(value), [])
  const onDeleted = useCallback(() => {
    setDirty(false)
    setSelectedId(null)
  }, [])

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[18rem_1fr]">
      <aside className="flex flex-col gap-3 lg:sticky lg:top-20">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={(event) => void onDragEnd(event)}
          sensors={sensors}
        >
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            <ol className="flex flex-col gap-2">
              {ordered.map((section) => (
                <SortableSectionItem
                  key={section.id}
                  onSelect={() => select(section.id)}
                  onToggle={() => void toggle(section)}
                  section={section}
                  selected={section.id === selectedId}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
        <AddSectionSelect disabled={adding} onAdd={add} />
        <p className="text-xs text-muted-foreground">
          <span className="mr-1 inline-block size-2 rounded-full bg-amber-500" />
          Las secciones sin llenar no aparecen en la invitación.
        </p>
      </aside>

      <section className="rounded-xl border bg-background p-4 sm:p-6">
        {selected ? (
          <EditorEventContext value={eventId}>
            <SectionForm
              key={selected.id}
              onDeleted={onDeleted}
              onDirtyChange={onDirtyChange}
              section={selected}
            />
          </EditorEventContext>
        ) : (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Elige una sección de la lista para editarla.
          </p>
        )}
      </section>
    </div>
  )
}
