// packages/db/scripts/migrate.ts

import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const env = process.env.APP_ENV ?? 'development'

// Load correct .env file
dotenv.config({ path: path.resolve(__dirname, `../../../.env.${env}`) })

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  process.exit(1)
}

const sql = postgres(DATABASE_URL, {
  max: 1,
  ssl: env === 'production' ? 'require' : false,
  onnotice: (_notice) => {},
})

const db = drizzle(sql)

try {
  await migrate(db, {
    migrationsFolder: path.resolve(__dirname, '../migrations'),
  })
} catch (_err) {
  console.error(_err)
  process.exit(1)
} finally {
  await sql.end()
}
