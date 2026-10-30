import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import './globals.css'

export const metadata: Metadata = {
  description: 'Invitaciones digitales con RSVP por invitado',
  title: 'Cool Invitations',
}

/**
 * Root layout for the whole app (CMS and public invitations).
 *
 * @param props - Layout props.
 * @param props.children - Active page.
 */
export default function RootLayout({ children }: LayoutProps<'/'>): ReactNode {
  return (
    <html className="h-full antialiased" lang="es">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
