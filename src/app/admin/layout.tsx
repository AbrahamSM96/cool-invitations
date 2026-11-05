import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import type { ReactNode } from 'react'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: { default: 'Panel', template: '%s · Cool Invitations' },
}

/**
 * Shell of every `/admin` page: the CMS font and toasts. The font lives here,
 * not in the root layout, so public invitations never download it.
 *
 * @param props - Layout props.
 * @param props.children - Active admin page.
 */
export default function AdminLayout({
  children,
}: LayoutProps<'/admin'>): ReactNode {
  return (
    <div className={cn(geist.variable, 'flex flex-1 flex-col font-sans')}>
      {children}
      <Toaster position="top-center" />
    </div>
  )
}
