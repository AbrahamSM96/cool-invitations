'use server'

import { consumeBackupCode } from '@/lib/auth/backup-codes'
import { checkLoginForm } from '@/lib/auth/form-token'
import { verifyAdminPassword } from '@/lib/auth/password'
import {
  isLoginBlocked,
  isTotpStepUsed,
  recordLoginAttempt,
} from '@/lib/auth/rate-limit'
import {
  createSessionValue,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from '@/lib/auth/session'
import { verifyTotp } from '@/lib/auth/totp'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

import type { LoginState } from './state'

/** Every answer takes at least this long, so timing reveals nothing. */
const MIN_RESPONSE_MS = 1000

/** Never says which of the two failed. */
const WRONG_CREDENTIALS = 'Contraseña o código incorrectos.'

/**
 * Waits until `MIN_RESPONSE_MS` (plus jitter) have passed since `startedAt`.
 *
 * @param startedAt - When the request started, from `Date.now()`.
 */
async function padResponse(startedAt: number): Promise<void> {
  const wait = MIN_RESPONSE_MS + Math.random() * 300 - (Date.now() - startedAt)
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
}

/**
 * Checks the second factor: a 6-digit app code (not reused) or an unused
 * backup code. Returns `false` or the TOTP window to store.
 *
 * @param code - Value of the code field.
 */
async function checkSecondFactor(
  code: string
): Promise<{ totpStep?: number } | false> {
  if (/^\d{6}$/.test(code)) {
    const step = verifyTotp(code)
    if (step === null || (await isTotpStepUsed(step))) return false
    return { totpStep: step }
  }
  return code.length <= 20 && (await consumeBackupCode(code)) ? {} : false
}

/**
 * Checks the admin password and second factor, then opens a session. Blocked IPs and bots are
 * refused without checking the password; bots get the same message as a
 * wrong password so they learn nothing.
 *
 * @param _previous - Previous form state (required by `useActionState`).
 * @param formData - Submitted form.
 */
export async function login(
  _previous: LoginState,
  formData: FormData
): Promise<LoginState> {
  const startedAt = Date.now()
  const requestHeaders = await headers()
  const ip =
    requestHeaders.get('x-real-ip') ??
    requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  const userAgent = requestHeaders.get('user-agent')

  const result = await attempt()
  await padResponse(startedAt)

  if (result === null) redirect('/admin')
  return { error: result, status: 'error' }

  /** Returns the error to show, or `null` once the session is open. */
  async function attempt(): Promise<string | null> {
    if (await isLoginBlocked(ip)) {
      // Counted too: hammering a locked login keeps it locked.
      await recordLoginAttempt({ ip, outcome: 'failure', userAgent })
      return 'Demasiados intentos. Inténtalo más tarde.'
    }

    const check = checkLoginForm(formData)
    if (check === 'bot') {
      await recordLoginAttempt({ ip, outcome: 'bot', userAgent })
      return WRONG_CREDENTIALS
    }
    if (check === 'expired') {
      return 'La página expiró. Recárgala e inténtalo de nuevo.'
    }

    const password = formData.get('password')
    const code = formData.get('code')
    const passwordOk =
      typeof password === 'string' &&
      password.length > 0 &&
      password.length <= 200 &&
      (await verifyAdminPassword(password))
    // Only after the password, so wrong guesses never burn a backup code.
    const factor =
      passwordOk && typeof code === 'string'
        ? await checkSecondFactor(code.trim())
        : false

    await recordLoginAttempt({
      ip,
      outcome: factor ? 'success' : 'failure',
      totpStep: factor ? factor.totpStep : undefined,
      userAgent,
    })
    if (!factor) return WRONG_CREDENTIALS

    ;(await cookies()).set(SESSION_COOKIE, createSessionValue(), {
      httpOnly: true,
      maxAge: SESSION_MAX_AGE,
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    })
    return null
  }
}

/** Closes the admin session. */
export async function logout(): Promise<void> {
  ;(await cookies()).delete(SESSION_COOKIE)
  redirect('/admin/login')
}
