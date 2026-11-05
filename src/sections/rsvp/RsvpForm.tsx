'use client'

import type { Voice } from '@/event-types'
import { type ReactNode, useActionState, useState } from 'react'

import { submitRsvp } from './actions'
import {
  MESSAGE_MAX_LENGTH,
  type RsvpAnswer,
  type RsvpFormState,
} from './schema'

interface RsvpFormProps {
  token: string
  displayName: string
  maxPasses: number
  askMessage: boolean
  thanksText: string
  declinedText: string
  /** "Te espero" (singular) vs "Te esperamos" (plural). */
  voice: Voice
  /** Current answer, if the guest already replied. */
  current: RsvpAnswer | null
}

const initialState: RsvpFormState = { status: 'idle' }

/**
 * Guest RSVP form. Shows the saved answer with an "update" button once replied.
 *
 * @param props - Form props.
 * @param props.askMessage - Show the optional message field.
 * @param props.current - Saved answer, if any.
 * @param props.declinedText - Shown after answering "no".
 * @param props.displayName - Guest name, e.g. "Abraham y Ana".
 * @param props.maxPasses - Most passes the guest can confirm.
 * @param props.thanksText - Shown after answering "yes".
 * @param props.token - Guest token.
 * @param props.voice - Grammatical voice of the hosts.
 */
export function RsvpForm({
  askMessage,
  current,
  declinedText,
  displayName,
  maxPasses,
  thanksText,
  token,
  voice,
}: RsvpFormProps): ReactNode {
  const [state, formAction, pending] = useActionState(
    submitRsvp.bind(null, token),
    initialState
  )
  const [response, setResponse] = useState(current?.response ?? 'yes')
  // Holds the form state at the moment "update" was clicked; any new submit
  // result replaces `state`, which closes the form again.
  const [editingFrom, setEditingFrom] = useState<RsvpFormState | null>(null)
  const answered = state.status === 'saved' ? state.answer : current
  const showForm =
    !answered || state.status === 'error' || editingFrom === state

  if (!showForm) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="font-display text-2xl leading-snug">
          {answered.response === 'yes'
            ? `¡Gracias, ${displayName}! ${voice === 'singular' ? 'Te espero' : 'Te esperamos'} con ${answered.passes} ${answered.passes === 1 ? 'pase' : 'pases'}.`
            : `Gracias por avisarnos, ${displayName}.`}
        </p>
        <p className="max-w-sm text-inv-muted">
          {answered.response === 'yes' ? thanksText : declinedText}
        </p>
        <button
          className="border border-inv-primary px-5 py-2 font-caps text-[11px] tracking-[0.2em] text-inv-primary uppercase"
          onClick={() => setEditingFrom(state)}
          type="button"
        >
          Actualizar respuesta
        </button>
      </div>
    )
  }

  return (
    <form
      action={formAction}
      className="flex w-full max-w-sm flex-col gap-5 text-left"
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">¿Asistirás?</legend>
        {(['yes', 'no'] as const).map((value) => (
          <label
            className="flex cursor-pointer items-center gap-3 border border-inv-accent/50 bg-white/50 px-4 py-3 has-checked:border-inv-primary has-checked:bg-inv-primary has-checked:text-inv-on-primary"
            key={value}
          >
            <input
              checked={response === value}
              className="accent-current"
              name="response"
              onChange={() => setResponse(value)}
              type="radio"
              value={value}
            />
            {value === 'yes' ? 'Sí, asistiré' : 'No podré asistir'}
          </label>
        ))}
      </fieldset>

      {response === 'yes' ? (
        <label className="flex flex-col gap-1">
          <span className="font-caps text-[10px] tracking-[0.25em] text-inv-accent uppercase">
            Número de pases (máx. {maxPasses})
          </span>
          <select
            className="border border-inv-accent/50 bg-white/50 px-3 py-2.5"
            defaultValue={answered?.passes || maxPasses}
            name="passes"
          >
            {Array.from({ length: maxPasses }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <input name="passes" type="hidden" value="0" />
      )}

      {askMessage ? (
        <label className="flex flex-col gap-1">
          <span className="font-caps text-[10px] tracking-[0.25em] text-inv-accent uppercase">
            {response === 'yes'
              ? 'Mensaje (opcional)'
              : 'Lamentamos que no puedas asistir, déjanos un mensaje'}
          </span>
          <textarea
            className="border border-inv-accent/50 bg-white/50 px-3 py-2.5"
            defaultValue={answered?.message ?? ''}
            maxLength={MESSAGE_MAX_LENGTH}
            name="message"
            rows={3}
          />
        </label>
      ) : (
        <input name="message" type="hidden" value="" />
      )}

      {state.status === 'error' ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        className="bg-inv-primary px-6 py-3.5 font-caps text-xs tracking-[0.25em] text-inv-on-primary uppercase shadow-sm disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? 'Enviando…' : 'Enviar respuesta'}
      </button>
    </form>
  )
}
