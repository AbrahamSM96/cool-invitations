import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { isValidSession, SESSION_COOKIE } from './session'

/**
 * Ends the request with a redirect to the login page unless the admin is
 * signed in. Call it in every admin page and Server Action: the proxy is
 * only a first filter.
 */
export async function requireAdmin(): Promise<void> {
  const session = (await cookies()).get(SESSION_COOKIE)?.value
  if (!isValidSession(session)) redirect('/admin/login')
}
