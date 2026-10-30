import { customAlphabet } from 'nanoid'

const ALPHANUMERIC =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

export const GUEST_TOKEN_LENGTH = 10
export const CLIENT_TOKEN_LENGTH = 16

/**
 * Creates the private token used in a guest's invitation URL.
 * Alphanumeric only, so it can be appended to a slug with a dash.
 */
export const createGuestToken = customAlphabet(ALPHANUMERIC, GUEST_TOKEN_LENGTH)

/**
 * Creates the token for the client's private guest-list page.
 */
export const createClientToken = customAlphabet(
  ALPHANUMERIC,
  CLIENT_TOKEN_LENGTH
)

/**
 * Builds the public path segment for a guest: `{slug}-{token}`.
 *
 * @param slug - Guest slug, e.g. `abraham-y-ana`.
 * @param token - Guest token.
 */
export function guestPathSegment(slug: string, token: string): string {
  return `${slug}-${token}`
}

/**
 * Splits a `{slug}-{token}` path segment back into its parts.
 * Returns `null` when the segment cannot contain a valid token.
 *
 * @param segment - Path segment from the URL.
 */
export function parseGuestPathSegment(
  segment: string
): { slug: string; token: string } | null {
  const token = segment.slice(-GUEST_TOKEN_LENGTH)
  const slug = segment.slice(0, -GUEST_TOKEN_LENGTH - 1)
  const separator = segment.at(-GUEST_TOKEN_LENGTH - 1)

  if (!slug || separator !== '-' || !/^[0-9A-Za-z]+$/.test(token)) return null

  return { slug, token }
}
