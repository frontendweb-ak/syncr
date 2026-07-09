// packages/db/scripts/reset.ts
// ⚠ DANGER: DEVELOPMENT ONLY
// Drops the entire database schema, reapplies migrations, and seeds the database.

import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const env = process.env.APP_ENV ?? 'development'

if (!env) {
  throw new Error('APP_ENV is not set.')
}

if (env === 'production') {
  throw new Error('Database reset is forbidden in production.')
}

dotenv.config({
  path: path.resolve(__dirname, `../../../.env.${env}`),
})

if (!process.env.DATABASE_URL) {
  process.exit(1)
}

const sql = postgres(process.env.DATABASE_URL, {
  max: 1,
})

try {
  await sql`DROP SCHEMA IF EXISTS drizzle CASCADE`
  await sql`DROP SCHEMA IF EXISTS public CASCADE`

  await sql`CREATE SCHEMA public`
  await sql`CREATE SCHEMA drizzle`

  // Only if using Supabase
  // await sql`GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role`;
  // await sql`GRANT ALL ON SCHEMA public TO postgres, service_role`;

  const db = drizzle(sql)

  await migrate(db, {
    migrationsFolder: path.resolve(__dirname, '../migrations'),
    migrationsSchema: 'drizzle',
  })

  // execSync("pnpm db:seed", { stdio: "inherit" });
  // await seedDatabase(db);
} catch (_error) {
  console.error(_error)
  process.exitCode = 1
} finally {
  await sql.end()
}
