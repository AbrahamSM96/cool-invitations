import { RsvpTotalsBar } from '@/components/admin/RsvpTotalsBar'
import { ClientGuestList } from '@/components/client/ClientGuestList'
import { getClientPage } from '@/data/client-page'
import { guestPath } from '@/lib/guest-link'
import { getRequestOrigin } from '@/lib/request-origin'
import { rsvpTotals } from '@/lib/rsvp-totals'
import { invitationMessage, whatsappLink } from '@/lib/whatsapp'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

/**
 * Loads the client page and builds every guest's links on the server.
 *
 * @param props - Component props.
 * @param props.params - Route params (`token`).
 */
export async function ClientPageLoader({
  params,
}: {
  params: Promise<{ token: string }>
}): Promise<ReactNode> {
  const { token } = await params
  const page = await getClientPage(token)
  if (!page) notFound()

  const origin = await getRequestOrigin()
  const guests = page.guests.map((guest) => {
    const link = `${origin}${guestPath(page.event.slug, guest)}`
    return {
      ...guest,
      link,
      whatsapp: guest.phone
        ? whatsappLink(
            guest.phone,
            invitationMessage(page.event, guest.displayName, link)
          )
        : null,
    }
  })

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <header>
        <p className="text-sm text-muted-foreground">Tus invitados</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {page.event.hostsName}
        </h1>
      </header>
      {!page.event.published ? (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
          La invitación todavía no está publicada: espera el aviso antes de
          enviar los links.
        </p>
      ) : null}
      <RsvpTotalsBar totals={rsvpTotals(page.guests)} />
      <ClientGuestList guests={guests} />
      <p className="text-center text-xs text-muted-foreground">
        Esta página es privada: no compartas su link.
      </p>
    </main>
  )
}
