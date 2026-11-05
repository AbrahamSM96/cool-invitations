import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

/**
 * Time-based one-time passwords (RFC 6238), the 6-digit codes of
 * authenticator apps. Both sides share a secret; the code is an HMAC of the
 * current 30-second window, so it changes every 30 s and never travels
 * anywhere but the login form.
 */

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const STEP_SECONDS = 30
const DIGITS = 6
/** Windows accepted on each side of now, for clock drift (±30 s). */
const DRIFT_STEPS = 1

/**
 * Encodes bytes as RFC 4648 base32, the format authenticator apps expect.
 *
 * @param bytes - Raw secret.
 */
function toBase32(bytes: Buffer): string {
  let bits = ''
  for (const byte of bytes) bits += byte.toString(2).padStart(8, '0')
  let out = ''
  for (let i = 0; i < bits.length; i += 5) {
    out += BASE32[Number.parseInt(bits.slice(i, i + 5).padEnd(5, '0'), 2)]
  }
  return out
}

/**
 * Decodes an RFC 4648 base32 string (spaces and padding ignored).
 *
 * @param text - Base32 secret.
 */
function fromBase32(text: string): Buffer {
  let bits = ''
  for (const char of text.toUpperCase().replaceAll(/[\s=]/g, '')) {
    const value = BASE32.indexOf(char)
    if (value === -1) throw new Error('Invalid base32 character')
    bits += value.toString(2).padStart(5, '0')
  }
  const bytes: number[] = []
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(Number.parseInt(bits.slice(i, i + 8), 2))
  }
  return Buffer.from(bytes)
}

/** Creates a new 160-bit secret, base32-encoded. */
export function createTotpSecret(): string {
  return toBase32(randomBytes(20))
}

/**
 * Computes the code for a time window (RFC 4226 HOTP over the window number).
 *
 * @param key - Decoded secret.
 * @param step - Window number: seconds since 1970 / 30.
 */
export function totpCode(key: Buffer, step: number): string {
  const counter = Buffer.alloc(8)
  counter.writeBigUInt64BE(BigInt(step))
  const hmac = createHmac('sha1', key).update(counter).digest()

  // Dynamic truncation: the last nibble picks 4 bytes out of the HMAC.
  const offset = (hmac.at(-1) ?? 0) & 0x0f
  const binary = hmac.readUInt32BE(offset) & 0x7f_ff_ff_ff
  return String(binary % 10 ** DIGITS).padStart(DIGITS, '0')
}

/**
 * Checks a code against `ADMIN_TOTP_SECRET`. Returns the matched window, so
 * the caller can refuse a code that was already used, or `null`.
 *
 * @param code - 6 digits from the authenticator app.
 */
export function verifyTotp(code: string): number | null {
  const secret = process.env.ADMIN_TOTP_SECRET
  if (!secret) throw new Error('ADMIN_TOTP_SECRET is not set')
  if (!/^\d{6}$/.test(code)) return null

  const key = fromBase32(secret)
  const now = Math.floor(Date.now() / 1000 / STEP_SECONDS)
  for (let step = now - DRIFT_STEPS; step <= now + DRIFT_STEPS; step++) {
    if (timingSafeEqual(Buffer.from(totpCode(key, step)), Buffer.from(code))) {
      return step
    }
  }
  return null
}

/**
 * Link encoded in the QR code that authenticator apps scan.
 *
 * @param secret - Base32 secret.
 * @param account - Label shown in the app.
 */
export function totpUri(secret: string, account: string): string {
  const issuer = 'Cool Invitations'
  const params = new URLSearchParams({
    algorithm: 'SHA1',
    digits: String(DIGITS),
    issuer,
    period: String(STEP_SECONDS),
    secret,
  })
  return `otpauth://totp/${encodeURIComponent(`${issuer}:${account}`)}?${params}`
}
