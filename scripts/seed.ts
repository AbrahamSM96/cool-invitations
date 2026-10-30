import { db } from '@/db'
import { events, guests, sections } from '@/db/schema'
import { createClientToken, guestPathSegment } from '@/lib/tokens'
/**
 * Seeds a demo wedding (Viridiana & Daniel) with two guests.
 * Safe to re-run: the event is deleted and recreated, guest tokens are fixed.
 *
 * Usage: bun run db:seed
 */
import { eq } from 'drizzle-orm'

const SLUG = 'viridiana-y-daniel'

await db.delete(events).where(eq(events.slug, SLUG))

const [event] = await db
  .insert(events)
  .values({
    cityLabel: 'Zimapán, Hidalgo',
    clientName: 'Viridiana y Daniel',
    clientToken: createClientToken(),
    hosts: {
      coupleDisplay: 'Viridiana & Daniel',
      partner1: { fullName: 'Viridiana', shortName: 'Viridiana' },
      partner2: { fullName: 'Daniel', shortName: 'Daniel' },
    },
    publishedAt: new Date(),
    rsvpDeadline: new Date('2026-11-07T23:59:00-06:00'),
    slug: SLUG,
    startsAt: new Date('2026-11-14T16:30:00-06:00'),
    status: 'published',
    templateKey: 'beige-oliva',
    title: 'Nos casamos',
    type: 'wedding',
    voice: 'plural',
  })
  .returning({ id: events.id })

if (!event) throw new Error('Event was not created')

const sectionData: { type: string; data: Record<string, unknown> }[] = [
  { data: {}, type: 'hero' },
  {
    data: { afterText: '¡Hoy es el gran día!', title: 'Faltan' },
    type: 'countdown',
  },
  { data: { title: 'Guarda la fecha' }, type: 'date' },
  {
    data: {
      address: 'Av. Hidalgo s/n, Centro, Zimapán, Hgo.',
      mapsUrl: 'https://maps.google.com/?q=Parroquia+San+Juan+Bautista+Zimapan',
      name: 'Parroquia de San Juan Bautista',
      note: 'Sé puntual',
      role: 'Ceremonia',
      time: '16:30',
    },
    type: 'venue',
  },
  {
    data: {
      address: 'Carretera Zimapán–Tasquillo km 3, Zimapán, Hgo.',
      mapsUrl: 'https://maps.google.com/?q=Zimapan+Hidalgo',
      name: 'Jardín Los Olivos',
      role: 'Recepción',
      time: '19:00',
    },
    type: 'venue',
  },
  {
    data: {
      askMessage: true,
      declinedText: 'Te vamos a extrañar. Gracias por tu mensaje.',
      genericText:
        'Para confirmar usa el link personal que te enviamos por WhatsApp.',
      thanksText: 'Nos hace muy felices celebrar contigo.',
      title: '¿Nos acompañas?',
    },
    type: 'rsvp',
  },
  {
    data: {
      message: 'Gracias por ser parte de nuestra historia.',
      signature: 'con amor, Viridiana & Daniel',
    },
    type: 'closing',
  },
]

await db.insert(sections).values(
  sectionData.map((section, position) => ({
    ...section,
    eventId: event.id,
    position,
  }))
)

const seededGuests = await db
  .insert(guests)
  .values([
    {
      displayName: 'Abraham y Ana',
      eventId: event.id,
      maxPasses: 2,
      slug: 'abraham-y-ana',
      table: '6',
      token: 'k2Hv2dFxQ8',
    },
    {
      displayName: 'Familia Pérez',
      eventId: event.id,
      maxPasses: 4,
      slug: 'familia-perez',
      table: '3',
      token: 'p9Lm4TzR1c',
    },
  ])
  .returning({ slug: guests.slug, token: guests.token })

process.stdout.write(`Seeded /e/${SLUG}\n`)
for (const guest of seededGuests) {
  process.stdout.write(
    `  /e/${SLUG}/${guestPathSegment(guest.slug, guest.token)}\n`
  )
}
