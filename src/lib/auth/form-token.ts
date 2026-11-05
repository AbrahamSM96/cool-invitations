import { sign, unsign } from './secret'

/** Name of the hidden field bots tend to fill. Not an autofill name. */
export const HONEYPOT_FIELD = 'contact_ref'
export const FORM_TOKEN_FIELD = 'form_token'

/** Faster than this is not a person typing a password. */
const MIN_FILL_MS = 1000
/** Older than this, the page must be reloaded. */
const MAX_AGE_MS = 60 * 60 * 1000

export type FormCheck = 'ok' | 'bot' | 'expired'

/** Signs the moment the login form was rendered. */
export function createFormToken(): string {
  return sign('login-form', String(Date.now()))
}

/**
 * Tells people from bots: forged or missing tokens, instant submits and a
 * filled honeypot are bots. An old token only means a stale tab.
 *
 * @param formData - Submitted login form.
 */
export function checkLoginForm(formData: FormData): FormCheck {
  const honeypot = formData.get(HONEYPOT_FIELD)
  if (typeof honeypot !== 'string' || honeypot !== '') return 'bot'

  const token = formData.get(FORM_TOKEN_FIELD)
  const issuedAt = Number(
    typeof token === 'string' ? unsign('login-form', token) : null
  )
  if (!Number.isFinite(issuedAt) || issuedAt === 0) return 'bot'

  const age = Date.now() - issuedAt
  if (age < MIN_FILL_MS) return 'bot'
  if (age > MAX_AGE_MS) return 'expired'
  return 'ok'
}
