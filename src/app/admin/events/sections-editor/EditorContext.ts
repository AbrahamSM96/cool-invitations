'use client'

import { createContext, use } from 'react'

/** Event the open section belongs to; fields deep in the form need it. */
export const EditorEventContext = createContext<string | null>(null)

/** Event id of the section editor. Throws outside of it. */
export function useEditorEventId(): string {
  const eventId = use(EditorEventContext)
  if (!eventId) throw new Error('useEditorEventId needs EditorEventContext')
  return eventId
}
