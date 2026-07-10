// ─────────────────────────────────────────────────────────────────
// errors/handler.ts
// ─────────────────────────────────────────────────────────────────

import type { Context, ErrorHandler, NotFoundHandler } from 'hono'
import { ZodError } from 'zod/v3'
import type { AppContext } from '../types/env'
import { mapToHttpException } from './mapper'
import { ValidationException } from './validation.error'

// ── Standard error response shape ─────────────────────────────
// Every error from AIM API looks exactly like this.
// Clients check success: false then read error.code.
type ErrorResponse = {
  success: false
  error: {
    code: string
    message: string
    // Present only for validation errors
    fields?: Record<string, string[]>
    // Present only in development mode
    stack?: string
    details?: unknown
  }
  meta: {
    requestId: string
    timestamp: string
  }
}

function isDev(c: Context<AppContext>): boolean {
  return c.env?.APP_ENV === 'development'
}

// ── Global error handler ───────────────────────────────────────
export const errorHandler: ErrorHandler<AppContext> = (err, c) => {
  console.error('========================================')
  console.error(err)
  console.error(err.stack)
  console.error('========================================')

  const requestId = c.get('requestId') ?? c.req.header('X-Request-Id') ?? 'unknown'

  // Convert ZodError → ValidationException
  if (err instanceof ZodError) {
    const details: Record<string, string[]> = {}

    for (const issue of err.issues) {
      const key = issue.path.join('.')

      if (!details[key]) {
        details[key] = []
      }

      details[key].push(issue.message)
    }
    err = new ValidationException(details)
  }

  // Map to typed exception
  const exception = mapToHttpException(err)

  // 5xx = server bug → log + capture in Sentry
  // 4xx = client error → warn only (not a bug, not Sentry-worthy)
  if (exception.statusCode >= 500) {
    // Sentry capture — only in production, only 5xx
    if (c.env?.ACCESS_TOKEN_SECRET === 'production') {
      // captureException(err, { extra: { requestId, path: c.req.path } });
      // Uncomment when Sentry is wired up
    }
  } else {
  }

  const body: ErrorResponse = {
    success: false,
    error: {
      code: exception.code,
      message: exception.message,
      // Validation: include field-level breakdown
      ...(exception.code === 'VALIDATION_FAILED' && exception.details
        ? { fields: exception.details as Record<string, string[]> }
        : {}),
      // Development only: stack + details
      ...(isDev(c) && err instanceof Error ? { stack: err.stack, details: exception.details } : {}),
    },
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
    },
  }

  c.get('logger').debug({ body, statusCode: exception.statusCode }, 'Error response')
  return c.json(body, exception.statusCode)
}

// ── Not found handler ──────────────────────────────────────────
export const notFoundHandler: NotFoundHandler<AppContext> = (c) => {
  const requestId = c.get('requestId') ?? 'unknown'

  return c.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${c.req.method} ${c.req.path} not found`,
      },
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      },
    } satisfies ErrorResponse,
    404,
  )
}
