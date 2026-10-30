'use client'

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
 */
export function RsvpForm({
  askMessage,
  current,
  declinedText,
  displayName,
  maxPasses,
  thanksText,
  token,
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
        <p className="font-display text-3xl text-inv-accent">
          {answered.response === 'yes'
            ? `¡Gracias, ${displayName}! Te esperamos con ${answered.passes} ${answered.passes === 1 ? 'pase' : 'pases'}.`
            : `Gracias por avisarnos, ${displayName}.`}
        </p>
        <p className="max-w-md">
          {answered.response === 'yes' ? thanksText : declinedText}
        </p>
        <button
          className="font-caps text-xs tracking-widest text-inv-muted uppercase underline"
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
      <fieldset className="flex gap-3">
        <legend className="sr-only">¿Asistirás?</legend>
        {(['yes', 'no'] as const).map((value) => (
          <label
            className="flex-1 cursor-pointer rounded-full border border-inv-accent px-4 py-2 text-center has-checked:bg-inv-accent has-checked:text-inv-on-accent"
            key={value}
          >
            <input
              checked={response === value}
              className="sr-only"
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
          <span className="font-caps text-xs tracking-widest text-inv-muted uppercase">
            Pases
          </span>
          <select
            className="rounded-md border border-inv-muted bg-transparent px-3 py-2"
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
          <span className="font-caps text-xs tracking-widest text-inv-muted uppercase">
            {response === 'yes'
              ? 'Mensaje (opcional)'
              : 'Lamentamos que no puedas asistir, déjanos un mensaje'}
          </span>
          <textarea
            className="rounded-md border border-inv-muted bg-transparent px-3 py-2"
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
        className="rounded-full bg-inv-accent px-6 py-3 font-caps text-sm tracking-widest text-inv-on-accent uppercase disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? 'Enviando…' : 'Enviar respuesta'}
      </button>
    </form>
  )
}
