import { requireAdmin } from '@/lib/auth/dal'
import type { ReactNode } from 'react'

import { logout } from './login/actions'

/** Admin home content. Checks the session before showing anything. */
export async function AdminHome(): Promise<ReactNode> {
  await requireAdmin()
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Eventos</h1>
        <form action={logout}>
          <button className="text-sm underline" type="submit">
            Cerrar sesión
          </button>
        </form>
      </div>
      <p className="text-neutral-600">Aquí irá la lista de eventos.</p>
    </main>
  )
}
