import { z } from 'zod'

// Default Zod messages in Spanish: CMS forms show them to the admin.
// Import this module before parsing anything user-facing.
z.config(z.locales.es())
