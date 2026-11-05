'use client'

import type { AdminSection } from '@/data/admin-sections'
import { cn } from '@/lib/utils'
import { sectionCatalog } from '@/sections/catalog'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { EyeIcon, EyeOffIcon, GripVerticalIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface SortableSectionItemProps {
  section: AdminSection
  selected: boolean
  onSelect: () => void
  onToggle: () => void
}

/**
 * Reads the most telling text of a section, e.g. a venue's title.
 *
 * @param data - Section data.
 */
function subtitleOf(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) return null
  const record = data as Record<string, unknown>
  const text = record.title ?? record.name ?? record.code
  return typeof text === 'string' && text ? text : null
}

/**
 * One row of the sections list: drag handle, name, completeness and a
 * show/hide toggle. Drag with the handle or the keyboard (space + arrows).
 *
 * @param props - Component props.
 * @param props.onSelect - Opens the section in the editor.
 * @param props.onToggle - Shows or hides the section.
 * @param props.section - Section of the row.
 * @param props.selected - Row is open in the editor.
 */
export function SortableSectionItem({
  onSelect,
  onToggle,
  section,
  selected,
}: SortableSectionItemProps): ReactNode {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id })
  const subtitle = subtitleOf(section.data)

  return (
    <li
      className={cn(
        'flex items-center gap-1 rounded-lg border bg-background pr-1 transition-shadow',
        selected && 'border-foreground/40 ring-2 ring-foreground/10',
        isDragging && 'z-10 shadow-lg',
        !section.enabled && 'opacity-60'
      )}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        aria-label="Arrastrar para reordenar"
        className="cursor-grab touch-none p-2 text-muted-foreground active:cursor-grabbing"
        type="button"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-4" />
      </button>
      <button
        className="flex min-w-0 flex-1 flex-col py-2 text-left"
        onClick={onSelect}
        type="button"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <span
            aria-hidden
            className={cn(
              'size-2 shrink-0 rounded-full',
              section.complete ? 'bg-emerald-500' : 'bg-amber-500'
            )}
          />
          {sectionCatalog[section.type].label}
        </span>
        <span className="truncate pl-4 text-xs text-muted-foreground">
          {section.complete ? (subtitle ?? 'Lista') : 'Falta llenar'}
        </span>
      </button>
      <button
        aria-label={section.enabled ? 'Ocultar sección' : 'Mostrar sección'}
        className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={onToggle}
        title={section.enabled ? 'Visible' : 'Oculta'}
        type="button"
      >
        {section.enabled ? (
          <EyeIcon className="size-4" />
        ) : (
          <EyeOffIcon className="size-4" />
        )}
      </button>
    </li>
  )
}
