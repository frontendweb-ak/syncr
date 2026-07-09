import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as dotenv from 'dotenv'

import { seedDatabase } from '../seeds'
import { createDbForScripts } from '../src/client'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const env = process.env.APP_ENV ?? 'development'

dotenv.config({ path: path.resolve(__dirname, `../../../.env.${env}`) })

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  process.exit(1)
}

async function main() {
  const { db, sql } = createDbForScripts(DATABASE_URL as string)

  try {
    await seedDatabase(db)
    console.log('✅ Database seeded successfully.')
  } finally {
    await sql.end({ timeout: 5 })
  }
}

main().catch((_err) => {
  console.error(_err)
  process.exit(1)
})
