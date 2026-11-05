import { headers } from 'next/headers'

/**
 * Origin of the current request, e.g. `https://cool-invitations.mx`, for
 * absolute links built on the server (WhatsApp messages).
 */
export async function getRequestOrigin(): Promise<string> {
  const list = await headers()
  const host =
    list.get('x-forwarded-host') ?? list.get('host') ?? 'localhost:3000'
  const protocol =
    list.get('x-forwarded-proto') ??
    (host.startsWith('localhost') ? 'http' : 'https')
  return `${protocol}://${host}`
}
