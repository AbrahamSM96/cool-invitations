/** Country code added to 10-digit numbers (Mexico). */
const DEFAULT_COUNTRY = '52'

/**
 * Normalizes a phone number to digits with country code, the format
 * `wa.me` links need, e.g. "55 1234 5678" → "525512345678".
 * Returns `null` when it cannot be a phone number.
 *
 * @param input - Number as typed or imported.
 */
export function normalizePhone(input: string): string | null {
  const hasPlus = input.trim().startsWith('+')
  let digits = input.replaceAll(/\D/g, '')

  if (!hasPlus && digits.length === 10) digits = DEFAULT_COUNTRY + digits
  // Old Mexican mobile prefix "521" is no longer used by WhatsApp.
  if (/^521\d{10}$/.test(digits)) digits = `52${digits.slice(3)}`

  return digits.length >= 10 && digits.length <= 15 ? digits : null
}

/**
 * Formats a normalized number for people, e.g. "+52 55 1234 5678".
 *
 * @param digits - Number from `normalizePhone`.
 */
export function formatPhone(digits: string): string {
  const mexican = /^52(\d{2})(\d{4})(\d{4})$/.exec(digits)
  return mexican
    ? `+52 ${mexican[1]} ${mexican[2]} ${mexican[3]}`
    : `+${digits}`
}
