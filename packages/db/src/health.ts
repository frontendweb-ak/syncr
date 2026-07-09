// packages/db/src/health.ts
import { sql } from 'drizzle-orm'
import type { Db } from './types'

export interface DatabaseHealth {
  status: 'up' | 'down'
  latency: number
  error?: unknown
}

export async function checkDatabase(db: Db): Promise<DatabaseHealth> {
  const started = performance.now()

  try {
    await db.execute(sql`select 1`)

    return {
      status: 'up',
      latency: Math.round(performance.now() - started),
    }
  } catch (error) {
    return {
      status: 'down',
      latency: Math.round(performance.now() - started),
      error,
    }
  }
}
