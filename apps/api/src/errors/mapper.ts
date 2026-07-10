// ─────────────────────────────────────────────────────────────────
// errors/mapper.ts
// ─────────────────────────────────────────────────────────────────
// Maps third-party errors (Zod, Drizzle, unknown) to HttpException.
// Centralising this mapping prevents ad-hoc try/catch in services.

import z, { ZodError } from 'zod'
import { BadRequestException } from './bad-request.error'
import { HttpException } from './exceptions'
import { ServiceUnavailableException } from './service-unavailable.error'
import { ValidationException } from './validation.error'

// PostgreSQL error codes from the driver
const PG_UNIQUE_VIOLATION = '23505'
const PG_FOREIGN_KEY = '23503'
const PG_NOT_NULL_VIOLATION = '23502'
const PG_CONNECTION_ERROR = '08006'
interface PgError {
  code?: string
  detail?: string
  column?: string
}
export function mapToHttpException(err: unknown): HttpException {
  // ── Already one of ours — pass through ────────────────────────
  if (err instanceof HttpException) return err

  // ── Zod validation error ───────────────────────────────────────
  if (err instanceof ZodError) {
    // Flatten into { field: ["error message", ...] }
    const fields = z.formatError(err)
    return new ValidationException(fields)
  }

  // ── Drizzle / PostgreSQL driver errors ─────────────────────────
  // postgres.js wraps PG errors — check the code field
  const pgCode = (err as PgError)?.code
  const pgDetail = (err as PgError)?.detail as string | undefined

  if (pgCode === PG_UNIQUE_VIOLATION) {
    // Extract the conflicting field from the detail message if present
    // e.g. "Key (phone)=(91...) already exists."
    const field = pgDetail?.match(/Key \((.+?)\)/)?.[1]
    const msg = field ? `${field} already exists` : 'A record with this value already exists'
    return new HttpException(409, 'DB_UNIQUE_VIOLATION', msg)
  }

  if (pgCode === PG_FOREIGN_KEY) {
    return new BadRequestException('Referenced record does not exist', 'DB_FOREIGN_KEY')
  }

  if (pgCode === PG_NOT_NULL_VIOLATION) {
    const column = (err as PgError)?.column as string | undefined
    return new BadRequestException(
      column ? `${column} is required` : 'A required field is missing',
      'MISSING_FIELD',
    )
  }

  if (pgCode === PG_CONNECTION_ERROR) {
    return new ServiceUnavailableException('Database connection failed')
  }

  // Drizzle timeout — postgres.js throws with message "connect ETIMEDOUT"
  const msg = (err as Error)?.message ?? ''
  if (msg.includes('ETIMEDOUT') || msg.includes('timeout')) {
    return new HttpException(503, 'DB_TIMEOUT', 'Database request timed out')
  }

  // ── Unknown — wrap as 500 ─────────────────────────────────────
  return new HttpException(
    500,
    'INTERNAL_SERVER_ERROR',
    'An unexpected error occurred',
    // Keep the original message for internal logging only
    process.env.NODE_ENV === 'development' ? msg : undefined,
  )
}
