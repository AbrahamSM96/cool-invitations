import { normalizePhone } from '@/lib/phone'
import { z } from 'zod'

import { Tone } from '../shared'

export const ContactSchema = z
  .object({
    contacts: z
      .array(
        z
          .object({
            name: z.string().min(1).meta({ title: 'Nombre' }),
            phone: z
              .string()
              .refine(
                (value) => normalizePhone(value) !== null,
                'Teléfono inválido.'
              )
              .meta({
                description: '10 dígitos o con +lada.',
                title: 'WhatsApp',
              }),
            role: z.string().optional().meta({
              description: 'Ej. "Wedding planner", "Mamá de la novia".',
              title: 'Quién es',
            }),
          })
          .meta({ fieldOrder: ['name', 'role', 'phone'] })
      )
      .min(1)
      .meta({ title: 'Contactos' }),
    text: z.string().optional().meta({ title: 'Texto', widget: 'textarea' }),
    title: z.string().default('¿Dudas?').meta({ title: 'Título' }),
    tone: Tone.default('soft'),
  })
  .meta({ fieldOrder: ['title', 'text', 'contacts', 'tone'] })

export type ContactData = z.infer<typeof ContactSchema>
