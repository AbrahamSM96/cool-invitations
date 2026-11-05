import { resolveGuestToken } from '@/data/short-link'
import type { NextRequest } from 'next/server'

/**
 * `GET /i/{token}`: short guest link → full invitation URL. Uses the
 * current slugs, so it keeps working after a rename.
 *
 * @param request - Incoming request.
 * @param context - Route context.
 * @param context.params - Route params (`token`).
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext<'/i/[token]'>
): Promise<Response> {
  const { token } = await params
  const path = await resolveGuestToken(token)
  if (!path) return new Response('Invitación no encontrada', { status: 404 })
  return Response.redirect(new URL(path, request.url), 307)
}
