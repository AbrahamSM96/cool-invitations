import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'

import { isValidSession, SESSION_COOKIE } from './session'

/**
 * Ends the request with a redirect to the login page unless the admin is
 * signed in. Call it in every admin page and Server Action: the proxy is
 * only a first filter.
 */
export async function requireAdmin(): Promise<void> {
  // The expiry check reads the clock: Cache Components needs the render
  // to be marked as per-request first (blocking-prerender-current-time).
  await connection()
  const session = (await cookies()).get(SESSION_COOKIE)?.value
  if (!isValidSession(session)) redirect('/admin/login')
}
