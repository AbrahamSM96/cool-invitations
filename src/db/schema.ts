import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

export const eventType = pgEnum('event_type', [
  'wedding',
  'xv',
  'birthday',
  'general',
])
export const eventStatus = pgEnum('event_status', [
  'draft',
  'published',
  'archived',
])
export const voice = pgEnum('voice', ['singular', 'plural'])
export const guestStatus = pgEnum('guest_status', ['enabled', 'disabled'])
export const rsvpResponse = pgEnum('rsvp_response', ['yes', 'no'])
export const loginOutcome = pgEnum('login_outcome', [
  'success',
  'failure',
  'bot',
])

const id = uuid('id').primaryKey().defaultRandom()
const createdAt = timestamp('created_at', { withTimezone: true })
  .notNull()
  .defaultNow()
const updatedAt = timestamp('updated_at', { withTimezone: true })
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date())

export const events = pgTable('events', {
  adultsOnly: boolean('adults_only').notNull().default(false),
  cityLabel: text('city_label'),
  clientName: text('client_name'),
  clientToken: text('client_token').notNull().unique(),
  createdAt,
  hashtag: text('hashtag'),
  hosts: jsonb('hosts').notNull().default({}),
  id,
  publishedAt: timestamp('published_at', { withTimezone: true }),
  rsvpDeadline: timestamp('rsvp_deadline', { withTimezone: true }),
  slug: text('slug').notNull().unique(),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  status: eventStatus('status').notNull().default('draft'),
  templateKey: text('template_key').notNull(),
  themeOverrides: jsonb('theme_overrides').notNull().default({}),
  timezone: text('timezone').notNull().default('America/Mexico_City'),
  title: text('title').notNull(),
  type: eventType('type').notNull(),
  updatedAt,
  voice: voice('voice').notNull(),
})

export const sections = pgTable('sections', {
  createdAt,
  data: jsonb('data').notNull().default({}),
  enabled: boolean('enabled').notNull().default(true),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  id,
  position: integer('position').notNull(),
  type: text('type').notNull(),
  updatedAt,
  variant: text('variant'),
})

export const guests = pgTable(
  'guests',
  {
    adults: integer('adults'),
    createdAt,
    displayName: text('display_name').notNull(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    group: text('group'),
    id,
    kids: integer('kids'),
    maxPasses: integer('max_passes').notNull().default(1),
    notes: text('notes'),
    personalMessage: text('personal_message'),
    phone: text('phone'),
    slug: text('slug').notNull(),
    status: guestStatus('status').notNull().default('enabled'),
    table: text('table'),
    token: text('token').notNull().unique(),
    updatedAt,
  },
  (t) => [uniqueIndex('guests_event_slug_idx').on(t.eventId, t.slug)]
)

export const rsvps = pgTable('rsvps', {
  answers: jsonb('answers').notNull().default({}),
  guestId: uuid('guest_id')
    .notNull()
    .unique()
    .references(() => guests.id, { onDelete: 'cascade' }),
  id,
  message: text('message'),
  passes: integer('passes').notNull(),
  respondedAt: timestamp('responded_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  response: rsvpResponse('response').notNull(),
  updatedAt,
})

export const rsvpHistory = pgTable('rsvp_history', {
  createdAt,
  guestId: uuid('guest_id')
    .notNull()
    .references(() => guests.id, { onDelete: 'cascade' }),
  id,
  ip: text('ip'),
  message: text('message'),
  passes: integer('passes').notNull(),
  response: rsvpResponse('response').notNull(),
  userAgent: text('user_agent'),
})

export const domains = pgTable('domains', {
  createdAt,
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  hostname: text('hostname').notNull().unique(),
  id,
  pathPrefix: text('path_prefix').notNull().default(''),
  verified: boolean('verified').notNull().default(false),
})

export const media = pgTable('media', {
  alt: text('alt'),
  createdAt,
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  height: integer('height'),
  id,
  kind: text('kind').notNull(),
  url: text('url').notNull(),
  width: integer('width'),
})

export const guestUploads = pgTable('guest_uploads', {
  approved: boolean('approved').notNull().default(false),
  createdAt,
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  guestId: uuid('guest_id').references(() => guests.id, {
    onDelete: 'set null',
  }),
  id,
  url: text('url').notNull(),
})

/** Admin login attempts, used for rate limiting and bot blocking. */
export const loginAttempts = pgTable(
  'login_attempts',
  {
    createdAt,
    id,
    ip: text('ip').notNull(),
    outcome: loginOutcome('outcome').notNull(),
    /** TOTP window used by a successful login, to refuse replays. */
    totpStep: integer('totp_step'),
    userAgent: text('user_agent'),
  },
  (t) => [
    index('login_attempts_ip_created_idx').on(t.ip, t.createdAt),
    index('login_attempts_created_idx').on(t.createdAt),
  ]
)

/** One-time admin codes for when the authenticator app is not at hand. */
export const adminBackupCodes = pgTable('admin_backup_codes', {
  codeHash: text('code_hash').notNull().unique(),
  createdAt,
  id,
  usedAt: timestamp('used_at', { withTimezone: true }),
})
