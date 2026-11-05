import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import type { ReactNode } from 'react'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  // Private page: no search engines, no token leaking through links.
  referrer: 'no-referrer',
  robots: { follow: false, index: false },
}

/**
 * Shell of the client's private page.
 *
 * @param props - Layout props.
 * @param props.children - Page.
 */
export default function ClientLayout({
  children,
}: LayoutProps<'/c'>): ReactNode {
  return (
    <div
      className={cn(
        geist.variable,
        'flex flex-1 flex-col bg-muted/40 font-sans'
      )}
    >
      {children}
      <Toaster position="top-center" />
    </div>
  )
}
