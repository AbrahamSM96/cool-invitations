'use client'

import { type ReactNode, useState } from 'react'

interface CopyButtonProps {
  value: string
  /** Accessible label, e.g. "Copiar número de BBVA". */
  label: string
}

/**
 * Copies a value to the clipboard and confirms for two seconds.
 *
 * @param props - Button props.
 * @param props.label - Accessible label.
 * @param props.value - Text to copy.
 */
export function CopyButton({ label, value }: CopyButtonProps): ReactNode {
  const [copied, setCopied] = useState(false)

  return (
    <button
      aria-label={label}
      className="shrink-0 rounded-full bg-inv-primary px-3 py-1.5 font-caps text-[10px] tracking-[0.2em] text-inv-on-primary uppercase"
      onClick={() => {
        void navigator.clipboard
          .writeText(value.replaceAll(' ', ''))
          .then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          })
      }}
      type="button"
    >
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  )
}
