import { createHash, randomBytes } from 'node:crypto'

import { db } from '@/db'
import { adminBackupCodes } from '@/db/schema'
import { and, eq, isNull, sql } from 'drizzle-orm'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const BACKUP_CODE_COUNT = 8

/**
 * Normalizes and hashes a backup code. Codes are random (50 bits), so a fast
 * hash is enough: guessing is capped by the login rate limit.
 *
 * @param code - Code as typed, e.g. `k7mq2-xr9tp`.
 */
function hashBackupCode(code: string): string {
  const normalized = code.toUpperCase().replaceAll(/[^A-Z0-9]/g, '')
  return createHash('sha256').update(normalized).digest('hex')
}

/** Creates one readable code, e.g. `K7MQ2-XR9TP`. */
function createBackupCode(): string {
  const chars = [...randomBytes(10)].map((byte) => ALPHABET[byte % 32])
  return `${chars.slice(0, 5).join('')}-${chars.slice(5).join('')}`
}

/**
 * Replaces every backup code with a new set and returns them in plain text.
 * Only call it from the setup script: the codes are shown once.
 */
export async function resetBackupCodes(): Promise<string[]> {
  const codes = Array.from({ length: BACKUP_CODE_COUNT }, createBackupCode)
  await db.batch([
    db.delete(adminBackupCodes),
    db
      .insert(adminBackupCodes)
      .values(codes.map((code) => ({ codeHash: hashBackupCode(code) }))),
  ])
  return codes
}

/**
 * Marks a backup code as used. Atomic, so a code works exactly once.
 *
 * @param code - Code typed in the login form.
 */
export async function consumeBackupCode(code: string): Promise<boolean> {
  const used = await db
    .update(adminBackupCodes)
    .set({ usedAt: sql`now()` })
    .where(
      and(
        eq(adminBackupCodes.codeHash, hashBackupCode(code)),
        isNull(adminBackupCodes.usedAt)
      )
    )
    .returning({ id: adminBackupCodes.id })
  return used.length > 0
}
