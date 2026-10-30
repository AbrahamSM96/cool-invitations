import { existsSync } from 'node:fs'

import { defineConfig } from 'drizzle-kit'

for (const file of ['.env.local', '.env']) {
  if (existsSync(file)) process.loadEnvFile(file)
}

// Migrations run over a direct connection: Neon's pooler (PgBouncer) runs in
// transaction mode, which is meant for app queries, not schema changes.
const directUrl = (process.env.DATABASE_URL ?? '').replace('-pooler.', '.')

export default defineConfig({
  dbCredentials: { url: directUrl },
  dialect: 'postgresql',
  out: './drizzle',
  schema: './src/db/schema.ts',
})
