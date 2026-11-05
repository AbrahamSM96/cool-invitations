import { requireAdmin } from '@/lib/auth/dal'
import type { ReactNode } from 'react'

/**
 * Renders its children only for a signed-in admin; otherwise redirects.
 * For pages whose content needs no data of its own.
 *
 * @param props - Component props.
 * @param props.children - Protected content.
 */
export async function AdminOnly({
  children,
}: {
  children: ReactNode
}): Promise<ReactNode> {
  await requireAdmin()
  return children
}
