'use client'

import { useFormContext } from 'react-hook-form'

/**
 * Current validation message of a form path, if any.
 *
 * @param name - Form path.
 */
export function useFieldError(name: string): { message?: string } | undefined {
  const { formState, getFieldState } = useFormContext()
  return getFieldState(name, formState).error
}
