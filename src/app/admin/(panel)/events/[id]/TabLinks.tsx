'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/**
 * Underlined tab bar; the tab matching the current path is active.
 *
 * @param props - Component props.
 * @param props.tabs - Tabs in order.
 */
export function TabLinks({
  tabs,
}: {
  tabs: { href: string; label: string }[]
}): ReactNode {
  const pathname = usePathname()
  return (
    <nav className="flex gap-1 overflow-x-auto border-b print:hidden">
      {tabs.map((tab) => {
        const active = pathname === tab.href
        return (
          <Link
            aria-current={active ? 'page' : undefined}
            className={cn(
              '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
            href={tab.href}
            key={tab.href}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
