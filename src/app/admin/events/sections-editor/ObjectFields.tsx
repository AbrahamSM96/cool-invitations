'use client'

import type { FieldNode } from '@/sections/form-fields'
import type { ReactNode } from 'react'

import { NodeField } from './NodeField'

/**
 * Fields of an object node, in display order. Fields used only by another
 * layout of the section are left out.
 *
 * @param props - Component props.
 * @param props.name - Path of the object; `''` for the section root.
 * @param props.node - Object description.
 * @param props.variant - Current section layout.
 */
export function ObjectFields({
  name,
  node,
  variant,
}: {
  name: string
  node: Extract<FieldNode, { kind: 'object' }>
  variant: string | null
}): ReactNode {
  return node.fields.map(([key, field]) => {
    const onlyFor = field.variants
    if (onlyFor && (!variant || !onlyFor.includes(variant))) return null
    const path = name ? `${name}.${key}` : key
    return <NodeField key={path} name={path} node={field} variant={variant} />
  })
}
