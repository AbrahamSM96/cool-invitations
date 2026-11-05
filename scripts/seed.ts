import { db } from '@/db'
import { events, guests, sections } from '@/db/schema'
import { createClientToken, guestPathSegment } from '@/lib/tokens'
/**
 * Seeds two demo invitations: a wedding (beige-oliva) and a XV (lila-real).
 * Safe to re-run: events are deleted and recreated, guest tokens are fixed.
 * Photos are placeholders from picsum.photos.
 *
 * Usage: bun run db:seed
 */
import { eq } from 'drizzle-orm'

type NewEvent = typeof events.$inferInsert
type NewGuest = Omit<typeof guests.$inferInsert, 'eventId'>

interface SeedSection {
  type: string
  variant?: string
  data: Record<string, unknown>
}

interface SeedEvent {
  event: Omit<NewEvent, 'clientToken'>
  sections: SeedSection[]
  guests: NewGuest[]
}

/**
 * Placeholder photo URL.
 *
 * @param seed - Picks a stable image.
 * @param width - Pixels.
 * @param height - Pixels.
 */
function photo(seed: string, width = 900, height = 1200): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`
}

const wedding: SeedEvent = {
  event: {
    cityLabel: 'Zimapán, Hidalgo',
    clientName: 'Viridiana y Daniel',
    hosts: {
      coupleDisplay: 'Viridiana & Daniel',
      partner1: { fullName: 'Viridiana', shortName: 'Viridiana' },
      partner2: { fullName: 'Daniel', shortName: 'Daniel' },
    },
    publishedAt: new Date(),
    rsvpDeadline: new Date('2026-11-07T23:59:00-06:00'),
    slug: 'viridiana-y-daniel',
    startsAt: new Date('2026-11-14T16:30:00-06:00'),
    status: 'published',
    templateKey: 'beige-oliva',
    title: 'Nos casamos',
    type: 'wedding',
    voice: 'plural',
  },
  guests: [
    {
      displayName: 'Abraham y Ana',
      maxPasses: 2,
      slug: 'abraham-y-ana',
      table: '6',
      token: 'k2Hv2dFxQ8',
    },
    {
      displayName: 'Familia Pérez',
      maxPasses: 4,
      slug: 'familia-perez',
      table: '3',
      token: 'p9Lm4TzR1c',
    },
  ],
  sections: [
    { data: { hint: 'Toca el sobre para abrir' }, type: 'envelope' },
    { data: {}, type: 'hero', variant: 'classic' },
    {
      data: { afterText: '¡Hoy es el gran día!', title: 'Faltan' },
      type: 'countdown',
    },
    {
      data: {
        eyebrow: 'Con todo nuestro amor',
        quote: {
          reference: 'Juan 15:12',
          text: 'Ámense los unos a los otros como yo los he amado.',
        },
        text: 'Después de varios años caminando juntos, decidimos unir nuestras vidas en matrimonio. Nos encantaría que fueras parte de este momento.',
      },
      type: 'intro',
    },
    {
      data: { alt: 'Viridiana y Daniel', imageUrl: photo('boda-pareja') },
      type: 'photo',
    },
    { data: {}, type: 'date' },
    {
      data: {
        address: 'Constitución No. 1, Centro, Zimapán, Hidalgo',
        eyebrow: 'La unión',
        imageUrl: photo('parroquia', 200, 200),
        mapsUrl:
          'https://maps.google.com/?q=Parroquia+San+Juan+Bautista+Zimapan',
        name: 'San Juan Bautista',
        note: 'Sé puntual',
        placeType: 'Parroquia',
        time: '4:30 PM',
        title: 'Ceremonia religiosa',
      },
      type: 'venue',
    },
    {
      data: {
        address: 'Salón Posada del Rey, Zimapán, Hidalgo',
        eyebrow: 'La celebración',
        imageUrl: photo('hotel', 200, 200),
        mapsUrl: 'https://maps.google.com/?q=Zimapan+Hidalgo',
        name: 'Royal Spa',
        placeType: 'Hotel',
        time: '7:00 PM',
        title: 'Recepción',
      },
      type: 'venue',
    },
    {
      data: {
        eyebrow: 'Bendición y familia',
        groups: [
          { names: ['Martha Zacarías Rangel'], title: 'Ella' },
          {
            names: ['Albertina Contreras Larios', 'Ricardo Acosta Ortiz'],
            title: 'Él',
          },
        ],
        title: 'Con la bendición de Dios y nuestros padres',
      },
      type: 'people',
    },
    {
      data: {
        code: 'Formal',
        eyebrow: 'Código de vestimenta',
        palette: [
          '#E9DFD0',
          '#CDBB9A',
          '#A9B79A',
          '#8FA79A',
          '#6F7A8C',
          '#9C8AA5',
          '#C9B08A',
        ],
        paletteNote: '¡Prepárense para una boda llena de colores!',
        reservedNote: 'Deja el blanco para la novia',
      },
      type: 'dress_code',
    },
    {
      data: {
        accounts: [
          { bank: 'BBVA', holder: 'Viridiana', number: '4152 3139 5453 4819' },
          {
            bank: 'Santander',
            holder: 'Daniel',
            number: '0143 1456 8414 6225 31',
          },
        ],
        eyebrow: 'Mesa de regalos',
        links: [
          { label: 'Liverpool', url: 'https://mesaderegalos.liverpool.com.mx' },
        ],
        text: 'Su presencia es el mejor regalo. Si desean honrarnos con un obsequio, en el lugar habrá sobres o pueden usar estas cuentas.',
        title: 'Un regalo de corazón',
      },
      type: 'gifts',
    },
    { data: { title: 'Tu pase', tone: 'base' }, type: 'guest_pass' },
    {
      data: {
        askMessage: true,
        declinedText: 'Te vamos a extrañar. Gracias por tu mensaje.',
        genericText:
          'Para confirmar usa el link personal que te enviamos por WhatsApp.',
        text: 'Celebrar nuestro amor es un sueño hecho realidad.',
        thanksText: 'Nos hace muy felices celebrar contigo.',
        title: '¿Nos acompañas?',
      },
      type: 'rsvp',
    },
    {
      data: {
        message:
          'Tu compañía en este día tan especial hará este momento aún más inolvidable. Gracias por ser parte del inicio de nuestra nueva historia.',
        signature: 'con amor, Viridiana & Daniel',
      },
      type: 'closing',
    },
  ],
}

const xv: SeedEvent = {
  event: {
    cityLabel: 'Guadalajara, Jalisco',
    clientName: 'Familia Ramírez',
    hosts: {
      honoree: { fullName: 'Camila Ramírez', shortName: 'Camila' },
      honoreeGender: 'female',
    },
    publishedAt: new Date(),
    rsvpDeadline: new Date('2026-12-05T23:59:00-06:00'),
    slug: 'xv-camila',
    startsAt: new Date('2026-12-19T17:30:00-06:00'),
    status: 'published',
    templateKey: 'lila-real',
    title: 'Mis XV años',
    type: 'xv',
    voice: 'singular',
  },
  guests: [
    {
      displayName: 'Sr. Alberto Sánchez y familia',
      maxPasses: 5,
      personalMessage: '¡Los espero para compartir este día único!',
      slug: 'alberto-sanchez',
      table: '8',
      token: 'x7Qe3RmN2b',
    },
  ],
  sections: [
    { data: { hint: 'Toca el sobre para abrir' }, type: 'envelope' },
    {
      data: { imageUrl: photo('xv-portada', 900, 1400) },
      type: 'hero',
      variant: 'photo',
    },
    {
      data: { afterText: '¡Hoy es mi gran día!', title: 'Faltan' },
      type: 'countdown',
    },
    { data: { title: 'Invitación válida para' }, type: 'guest_pass' },
    {
      data: {
        text: 'Hay momentos en la vida que siempre vamos a recordar. ¡Te espero para compartir juntos uno de los días más especiales de mi vida!',
      },
      type: 'intro',
    },
    { data: { alt: 'Camila', imageUrl: photo('xv-retrato') }, type: 'photo' },
    { data: {}, type: 'date' },
    {
      data: {
        address: 'Av. Fray Antonio Alcalde 10, Zona Centro, Guadalajara',
        eyebrow: 'Dónde y cuándo',
        imageUrl: photo('catedral', 200, 200),
        mapsUrl: 'https://maps.google.com/?q=Catedral+de+Guadalajara',
        name: 'Catedral de Guadalajara',
        placeType: 'Misa',
        time: '5:30 PM',
        title: 'Ceremonia',
      },
      type: 'venue',
    },
    {
      data: {
        address: 'Camino Real a Colima 500, Tlaquepaque',
        imageUrl: photo('hacienda', 200, 200),
        mapsUrl: 'https://maps.google.com/?q=Tlaquepaque+Jalisco',
        name: 'Hacienda Los Morales',
        placeType: 'Salón',
        time: '8:00 PM',
        title: 'Recepción',
        tone: 'soft',
      },
      type: 'venue',
    },
    {
      data: {
        groups: [
          { names: ['Laura Gómez', 'Roberto Ramírez'], title: 'Mis padres' },
          { names: ['Ana Torres', 'Luis Herrera'], title: 'Mis padrinos' },
        ],
        title: 'Con la bendición de Dios y de',
      },
      type: 'people',
    },
    {
      data: {
        code: 'Etiqueta',
        eyebrow: 'Código de vestimenta',
        reservedNote: 'El lila se reserva para la quinceañera',
        tone: 'base',
      },
      type: 'dress_code',
    },
    {
      data: {
        eyebrow: 'Regalos',
        text: 'Tu presencia es mi mejor regalo. Si deseas tener un detalle conmigo, habrá lluvia de sobres.',
        title: 'Lluvia de sobres',
        tone: 'soft',
      },
      type: 'gifts',
    },
    {
      data: {
        askMessage: true,
        declinedText: 'Te voy a extrañar. ¡Gracias por avisarme!',
        genericText:
          'Para confirmar usa el link personal que te envié por WhatsApp.',
        thanksText: '¡Qué emoción! Nos vemos en la fiesta.',
        title: '¡Te espero!',
      },
      type: 'rsvp',
    },
    {
      data: {
        message:
          'Gracias por acompañarme en este día que guardaré para siempre en mi corazón.',
        signature: 'con cariño, Camila',
      },
      type: 'closing',
    },
  ],
}

for (const seed of [wedding, xv]) {
  await db.delete(events).where(eq(events.slug, seed.event.slug))

  const [event] = await db
    .insert(events)
    .values({ ...seed.event, clientToken: createClientToken() })
    .returning({ id: events.id })

  if (!event) throw new Error(`Event ${seed.event.slug} was not created`)

  await db.insert(sections).values(
    seed.sections.map((section, position) => ({
      ...section,
      eventId: event.id,
      position,
    }))
  )

  const created = await db
    .insert(guests)
    .values(seed.guests.map((guest) => ({ ...guest, eventId: event.id })))
    .returning({ slug: guests.slug, token: guests.token })

  process.stdout.write(`Seeded /e/${seed.event.slug}\n`)
  for (const guest of created) {
    process.stdout.write(
      `  /e/${seed.event.slug}/${guestPathSegment(guest.slug, guest.token)}\n`
    )
  }
}
