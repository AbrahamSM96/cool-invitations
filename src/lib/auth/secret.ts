import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Reads the key used to sign admin cookies and form tokens.
 * Rotating it logs the admin out everywhere.
 */
function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET must be at least 32 characters')
  }
  return secret
}

/**
 * Signs `payload` for a given purpose, so a token for one use (e.g. a form)
 * can never be replayed as another (e.g. a session).
 *
 * @param purpose - Token kind, part of the signature.
 * @param payload - Value to sign.
 */
export function sign(purpose: string, payload: string): string {
  const mac = createHmac('sha256', getSecret())
    .update(`${purpose}:${payload}`)
    .digest('base64url')
  return `${payload}.${mac}`
}

/**
 * Returns the payload of a token made by `sign`, or `null` if it was forged.
 *
 * @param purpose - Token kind it must have been signed for.
 * @param token - Signed token.
 */
export function unsign(purpose: string, token: string): string | null {
  const dot = token.lastIndexOf('.')
  if (dot <= 0) return null

  const payload = token.slice(0, dot)
  const expected = Buffer.from(sign(purpose, payload))
  const actual = Buffer.from(token)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
    ? payload
    : null
}
