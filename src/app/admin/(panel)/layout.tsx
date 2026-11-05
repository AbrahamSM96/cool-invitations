import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { logout } from '../login/actions'

/**
 * Signed-in admin chrome: top bar with navigation and logout. Each page
 * checks the session itself (`requireAdmin`).
 *
 * @param props - Layout props.
 * @param props.children - Active admin page.
 */
export default function PanelLayout({
  children,
}: LayoutProps<'/admin'>): ReactNode {
  return (
    <div className="flex flex-1 flex-col bg-muted/40">
      <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-6 px-4">
          <Link className="font-semibold tracking-tight" href="/admin">
            Cool Invitations
          </Link>
          <nav className="flex flex-1 gap-1 text-sm">
            <Link
              className={buttonVariants({ size: 'sm', variant: 'ghost' })}
              href="/admin"
            >
              Eventos
            </Link>
          </nav>
          <form action={logout}>
            <button
              className={buttonVariants({ size: 'sm', variant: 'ghost' })}
              type="submit"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  )
}
