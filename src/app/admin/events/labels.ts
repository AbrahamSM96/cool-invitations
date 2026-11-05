import type { events } from '@/db/schema'

type EventStatus = (typeof events.$inferSelect)['status']

export const STATUS_LABELS: Record<EventStatus, string> = {
  archived: 'Archivado',
  draft: 'Borrador',
  published: 'Publicado',
}

export const VOICE_LABELS = {
  plural: 'Plural ("Los esperamos")',
  singular: 'Singular ("Te espero")',
} as const

/** Time zones offered in the CMS. Any valid IANA name is still accepted. */
export const TIME_ZONES: Record<string, string> = {
  'America/Cancun': 'Cancún (Quintana Roo)',
  'America/Chihuahua': 'Chihuahua',
  'America/Hermosillo': 'Hermosillo (Sonora)',
  'America/Mazatlan': 'Mazatlán (Pacífico)',
  'America/Mexico_City': 'Centro (CDMX, Guadalajara, Monterrey)',
  'America/Tijuana': 'Tijuana (Noroeste)',
}
