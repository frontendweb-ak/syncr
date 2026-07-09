// packages/db/src/client.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/index'

export type DbConfig = {
  DATABASE_URL: string
  ENVIRONMENT?: string
}

// Called per Cloudflare Worker request.
// Each Worker isolate gets 1 connection via PgBouncer.
export function createDb(env: DbConfig) {
  const sql = postgres(env.DATABASE_URL, {
    // ── Critical for Cloudflare Workers + PgBouncer ──────────────
    max: 1, // 1 connection per Worker isolate
    prepare: false, // PgBouncer transaction mode: no prepared stmts
    idle_timeout: 20, // release connection after 20s idle
    connect_timeout: 10, // fail fast if DB unreachable

    // ── Connection health ────────────────────────────────────────
    onnotice: () => {}, // suppress PostgreSQL NOTICE logs
    connection: {
      application_name: 'aim-api',
    },

    // ── SSL: required for Supabase ───────────────────────────────
    ssl: env.ENVIRONMENT === 'production',

    // ── Transform: snake_case DB ↔ camelCase JS ──────────────────
    transform: postgres.camel, // auto-converts column names
  })

  return drizzle(sql, {
    schema,
    logger:
      env.ENVIRONMENT === 'development'
        ? {
            logQuery: (_query, _params) => {},
          }
        : false,
  })
}

// ── Singleton for scripts (migrate, seed) ────────────────────────
// Scripts run in Node.js — can use higher connection limits
export function createDbForScripts(directUrl: string) {
  const sql = postgres(directUrl, {
    max: 10,
    prepare: true,
    ssl: process.env.APP_ENV === 'production' ? 'require' : false,
    transform: postgres.camel,
  })

  return {
    db: drizzle(sql, { schema, logger: true }),
    sql,
  }
}
