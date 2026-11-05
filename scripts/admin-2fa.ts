import { resetBackupCodes } from '@/lib/auth/backup-codes'
import { createTotpSecret, totpUri } from '@/lib/auth/totp'
/**
 * Sets up two-factor login: prints a new TOTP secret as a QR code for the
 * authenticator app and replaces the backup codes in the database.
 * Running it again invalidates the previous app entry and backup codes.
 *
 * Usage: bun run admin:2fa
 */
import QRCode from 'qrcode'

const secret = createTotpSecret()
const qr = await QRCode.toString(totpUri(secret, 'admin'), {
  small: true,
  type: 'terminal',
})
const codes = await resetBackupCodes()

process.stdout.write(
  [
    '1. Escanea este QR con tu app de autenticación:',
    '',
    qr,
    `   ¿No puedes escanear? Escribe esta clave a mano: ${secret}`,
    '',
    '2. Agrega esto a .env.local (y a Vercel):',
    '',
    `ADMIN_TOTP_SECRET=${secret}`,
    '',
    '3. Guarda estos códigos de respaldo en un lugar seguro.',
    '   Cada uno sirve una sola vez; no se vuelven a mostrar:',
    '',
    ...codes.map((code) => `   ${code}`),
    '',
  ].join('\n')
)
