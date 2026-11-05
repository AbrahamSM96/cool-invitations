import { sign, unsign } from './secret'

export const SESSION_COOKIE = 'admin_session'
/** Session length in seconds (8 hours). */
export const SESSION_MAX_AGE = 60 * 60 * 8

/** Creates the signed admin session cookie value. */
export function createSessionValue(): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000
  return sign('session', String(expiresAt))
}

/**
 * Checks a session cookie value. No database access, so it is safe to call
 * from the proxy on every request.
 *
 * @param value - Cookie value, if present.
 */
export function isValidSession(value: string | undefined): boolean {
  if (!value) return false
  const expiresAt = Number(unsign('session', value))
  return Number.isFinite(expiresAt) && expiresAt > Date.now()
}
