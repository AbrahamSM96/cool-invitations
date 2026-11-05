/**
 * Prints the admin env vars: a password hash and a fresh session secret.
 * The password is asked interactively, so it never lands in shell history.
 *
 * Usage: bun run admin:credentials
 */
import { randomBytes } from 'node:crypto'
import { createInterface } from 'node:readline/promises'

import { hashPassword } from '@/lib/auth/password'

const prompt = createInterface({ input: process.stdin, output: process.stdout })
const password = (
  await prompt.question('Contraseña del admin (mínimo 12 caracteres): ')
).trim()
prompt.close()

if (password.length < 12) {
  process.stderr.write('La contraseña debe tener al menos 12 caracteres.\n')
  process.exit(1)
}

process.stdout.write(
  [
    '',
    'Agrega esto a .env.local (y a Vercel):',
    '',
    `ADMIN_PASSWORD_HASH=${await hashPassword(password)}`,
    `ADMIN_SESSION_SECRET=${randomBytes(32).toString('base64url')}`,
    '',
  ].join('\n')
)
