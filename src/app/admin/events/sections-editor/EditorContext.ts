'use client'

import type { Place } from '@/lib/places'
import { createContext, use } from 'react'

interface EditorEvent {
  id: string
  places: Place[]
}

/** Event the open section belongs to; fields deep in the form need it. */
export const EditorEventContext = createContext<EditorEvent | null>(null)

/** Event of the section editor. Throws outside of it. */
function useEditorEvent(): EditorEvent {
  const event = use(EditorEventContext)
  if (!event) throw new Error('Section fields need EditorEventContext')
  return event
}

/** Event id of the section editor. */
export function useEditorEventId(): string {
  return useEditorEvent().id
}

/** Places of the event, for "Lugar" sections. */
export function useEditorPlaces(): Place[] {
  return useEditorEvent().places
}
