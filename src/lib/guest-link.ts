import { guestPathSegment } from './tokens'

/**
 * Public path of a guest's invitation, e.g.
 * `/e/viridiana-y-daniel/abraham-y-ana-k2Hv2dFxQ8`.
 *
 * @param eventSlug - Event slug.
 * @param guest - Guest slug and token.
 * @param guest.slug - Guest slug.
 * @param guest.token - Guest token.
 */
export function guestPath(
  eventSlug: string,
  guest: { slug: string; token: string }
): string {
  return `/e/${eventSlug}/${guestPathSegment(guest.slug, guest.token)}`
}
