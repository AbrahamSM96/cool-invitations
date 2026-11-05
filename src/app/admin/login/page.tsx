import type { Metadata } from 'next'
import { type ReactNode, Suspense } from 'react'

import { TokenedLoginForm } from './TokenedLoginForm'

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Entrar · Cool Invitations',
}

/** Admin login: `/admin/login`. */
export default function LoginPage(): ReactNode {
  return (
    <main className="flex flex-1 items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-xl font-semibold">Panel de administración</h1>
        <Suspense>
          <TokenedLoginForm />
        </Suspense>
      </div>
    </main>
  )
}
