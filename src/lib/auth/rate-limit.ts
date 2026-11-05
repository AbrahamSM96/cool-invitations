import { db } from '@/db'
import { loginAttempts } from '@/db/schema'
import { and, eq, gt, gte, lt, or, type SQL, sql } from 'drizzle-orm'

type Outcome = (typeof loginAttempts.$inferInsert)['outcome']

/** Lock rules, checked in order. Windows in minutes. */
const LIMITS = {
  /** Many IPs at once (botnet): closes the login for everyone. */
  global: { max: 50, window: 15 },
  /** A bot hit from this IP blocks it for a day. */
  ipBot: { max: 1, window: 24 * 60 },
  /** Slow, steady guessing from one IP. */
  ipLong: { max: 10, window: 24 * 60 },
  /** Short burst from one IP. */
  ipShort: { max: 5, window: 15 },
}

/** Days of attempts kept for auditing. */
const RETENTION_DAYS = 30

/**
 * SQL condition for "created in the last `minutes`".
 *
 * @param minutes - Window size.
 */
function within(minutes: number): SQL {
  return gt(
    loginAttempts.createdAt,
    sql`now() - make_interval(mins => ${minutes})`
  )
}

/**
 * Counts the rows of the current query that match `condition`.
 *
 * @param condition - Filter for the count.
 */
function count(condition: SQL | undefined): SQL<number> {
  return sql<number>`count(*) filter (where ${condition})`.mapWith(Number)
}

/**
 * Tells whether a login from `ip` must be refused before checking the
 * password. One query over the last 24 hours.
 *
 * @param ip - Client IP.
 */
export async function isLoginBlocked(ip: string): Promise<boolean> {
  const failed = or(
    eq(loginAttempts.outcome, 'failure'),
    eq(loginAttempts.outcome, 'bot')
  )
  const fromIp = eq(loginAttempts.ip, ip)
  const [row] = await db
    .select({
      global: count(and(failed, within(LIMITS.global.window))),
      ipBot: count(and(fromIp, eq(loginAttempts.outcome, 'bot'))),
      ipLong: count(and(fromIp, failed)),
      ipShort: count(and(fromIp, failed, within(LIMITS.ipShort.window))),
    })
    .from(loginAttempts)
    .where(within(24 * 60))

  if (!row) return false
  return (Object.keys(LIMITS) as (keyof typeof LIMITS)[]).some(
    (rule) => row[rule] >= LIMITS[rule].max
  )
}

/**
 * Stores an attempt and drops the ones past the retention period.
 *
 * @param attempt - Attempt to store.
 * @param attempt.ip - Client IP.
 * @param attempt.outcome - What happened.
 * @param attempt.totpStep - TOTP window of a successful login.
 * @param attempt.userAgent - Client user agent.
 */
export async function recordLoginAttempt(attempt: {
  ip: string
  outcome: Outcome
  totpStep?: number
  userAgent: string | null
}): Promise<void> {
  await db.batch([
    db.insert(loginAttempts).values(attempt),
    db
      .delete(loginAttempts)
      .where(
        lt(
          loginAttempts.createdAt,
          sql`now() - make_interval(days => ${RETENTION_DAYS})`
        )
      ),
  ])
}

/**
 * Tells whether a TOTP window (or a later one) already opened a session, so
 * a code seen over someone's shoulder cannot be reused.
 *
 * @param step - Window matched by `verifyTotp`.
 */
export async function isTotpStepUsed(step: number): Promise<boolean> {
  const [row] = await db
    .select({ id: loginAttempts.id })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.outcome, 'success'),
        gte(loginAttempts.totpStep, step)
      )
    )
    .limit(1)
  return row !== undefined
}
