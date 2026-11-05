'use client'

import { Button } from '@/components/ui/button'
import { PrinterIcon } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * Opens the browser's print dialog for the current page.
 *
 * @param props - Component props.
 * @param props.label - Button text.
 */
export function PrintButton({ label }: { label: string }): ReactNode {
  return (
    <Button
      className="print:hidden"
      onClick={() => window.print()}
      size="sm"
      type="button"
      variant="outline"
    >
      <PrinterIcon /> {label}
    </Button>
  )
}
