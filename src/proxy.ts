import { type NextRequest, NextResponse } from 'next/server'

import { isValidSession, SESSION_COOKIE } from './lib/auth/session'

/**
 * Optimistic admin check from the cookie only (no database). Pages and
 * Server Actions still call `requireAdmin`.
 *
 * @param request - Incoming request.
 */
export function proxy(request: NextRequest): NextResponse {
  const signedIn = isValidSession(request.cookies.get(SESSION_COOKIE)?.value)
  const onLogin = request.nextUrl.pathname === '/admin/login'

  if (!signedIn && !onLogin) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  if (signedIn && onLogin) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
