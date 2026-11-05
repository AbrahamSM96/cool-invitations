'use client'

import type { FieldNode } from '@/sections/form-fields'
import type { ReactNode } from 'react'

import { ArrayField } from './ArrayField'
import { BooleanField } from './BooleanField'
import { EnumField } from './EnumField'
import { ImageUploadField } from './ImageUploadField'
import { InputField } from './InputField'
import { ObjectFields } from './ObjectFields'
import { PrimitiveListField } from './PrimitiveListField'

export interface NodeFieldProps {
  node: FieldNode
  /** Form path, e.g. `groups.0.title`. */
  name: string
  /** Section layout; fields of other layouts are hidden. */
  variant: string | null
}

/**
 * Renders the input for one described schema field.
 *
 * @param props - Field props.
 * @param props.name - Form path.
 * @param props.node - Field description.
 * @param props.variant - Current section layout.
 */
export function NodeField({ name, node, variant }: NodeFieldProps): ReactNode {
  switch (node.kind) {
    case 'object':
      return (
        <fieldset className="flex flex-col gap-4 rounded-lg border p-4">
          {node.label ? (
            <legend className="px-1 text-sm font-medium">{node.label}</legend>
          ) : null}
          <ObjectFields name={name} node={node} variant={variant} />
        </fieldset>
      )
    case 'array':
      return node.item.kind === 'object' ? (
        <ArrayField name={name} node={node} variant={variant} />
      ) : (
        <PrimitiveListField name={name} node={node} />
      )
    case 'enum':
      return <EnumField name={name} node={node} />
    case 'image':
      return <ImageUploadField name={name} node={node} />
    case 'boolean':
      return <BooleanField name={name} node={node} />
    case 'unsupported':
      return null
    default:
      return <InputField name={name} node={node} />
  }
}
