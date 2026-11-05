import {
  randomBytes,
  scrypt,
  type ScryptOptions,
  timingSafeEqual,
} from 'node:crypto'

const KEY_LENGTH = 64
const OPTIONS = { N: 2 ** 15, maxmem: 64 * 1024 * 1024, p: 1, r: 8 }

/**
 * Promise wrapper around `crypto.scrypt`.
 *
 * @param password - Plain password.
 * @param salt - Random salt.
 * @param options - Cost parameters.
 */
function derive(
  password: string,
  salt: Buffer,
  options: ScryptOptions
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, options, (error, key) =>
      error ? reject(error) : resolve(key)
    )
  })
}

/**
 * Hashes a password for `ADMIN_PASSWORD_HASH`. Format:
 * `scrypt:{N}:{r}:{p}:{salt}:{hash}` (base64url, no `$` so `.env` keeps it).
 *
 * @param password - Plain password.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await derive(password, salt, OPTIONS)
  const { N, p, r } = OPTIONS
  return [
    'scrypt',
    N,
    r,
    p,
    salt.toString('base64url'),
    key.toString('base64url'),
  ].join(':')
}

/**
 * Compares a password with `ADMIN_PASSWORD_HASH` in constant time.
 *
 * @param password - Submitted password.
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const stored = process.env.ADMIN_PASSWORD_HASH
  if (!stored) throw new Error('ADMIN_PASSWORD_HASH is not set')

  const [scheme, n, r, p, salt, hash] = stored.split(':')
  if (scheme !== 'scrypt' || !salt || !hash) {
    throw new Error('ADMIN_PASSWORD_HASH has an invalid format')
  }

  const expected = Buffer.from(hash, 'base64url')
  const key = await derive(password, Buffer.from(salt, 'base64url'), {
    ...OPTIONS,
    N: Number(n),
    p: Number(p),
    r: Number(r),
  })
  return timingSafeEqual(key, expected)
}
