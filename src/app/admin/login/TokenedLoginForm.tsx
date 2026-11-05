import { createFormToken } from '@/lib/auth/form-token'
import { connection } from 'next/server'
import type { ReactNode } from 'react'

import { LoginForm } from './LoginForm'

/** Signs the render time per request, so it cannot be prerendered. */
export async function TokenedLoginForm(): Promise<ReactNode> {
  await connection()
  return <LoginForm formToken={createFormToken()} />
}
