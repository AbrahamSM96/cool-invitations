'use client'

import { FORM_TOKEN_FIELD, HONEYPOT_FIELD } from '@/lib/auth/form-token'
import { type ReactNode, useActionState } from 'react'

import { login } from './actions'
import type { LoginState } from './state'

const initialState: LoginState = { status: 'idle' }

/**
 * Admin password form.
 *
 * @param props - Form props.
 * @param props.formToken - Signed render time, checked by the action.
 */
export function LoginForm({ formToken }: { formToken: string }): ReactNode {
  const [state, formAction, pending] = useActionState(login, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input name={FORM_TOKEN_FIELD} type="hidden" value={formToken} />
      {/* Honeypot: hidden from people and screen readers, bots fill it. */}
      <div
        aria-hidden
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label>
          No llenar
          <input
            autoComplete="off"
            name={HONEYPOT_FIELD}
            tabIndex={-1}
            type="text"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Contraseña
        <input
          autoComplete="current-password"
          className="rounded-md border border-neutral-300 px-3 py-2 text-base font-normal"
          maxLength={200}
          name="password"
          required
          type="password"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Código de verificación
        <input
          autoComplete="one-time-code"
          className="rounded-md border border-neutral-300 px-3 py-2 text-base font-normal tracking-widest"
          maxLength={20}
          name="code"
          placeholder="123456"
          required
          type="text"
        />
        <span className="text-xs font-normal text-neutral-500">
          De tu app de autenticación, o un código de respaldo.
        </span>
      </label>

      {state.status === 'error' ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        className="rounded-md bg-neutral-900 px-4 py-2 text-white disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}
