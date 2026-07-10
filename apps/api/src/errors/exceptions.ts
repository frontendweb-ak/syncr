// ─────────────────────────────────────────────────────────────────
// errors/exceptions.ts
// ─────────────────────────────────────────────────────────────────

import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { ErrorCode } from './codes'
import { ErrorMessage } from './messages'

// ── Base exception ─────────────────────────────────────────────
// All AIM exceptions extend this.
// statusCode and code are always set — no guessing in the handler.
export class HttpException<T = unknown> extends Error {
  constructor(
    public readonly statusCode: ContentfulStatusCode,
    public readonly code: ErrorCode,
    message: string,
    // Optional structured details (only sent in dev or to admins)
    public readonly details?: T,
  ) {
    super(message ?? ErrorMessage[code])
    this.name = 'HttpException'
    // Fix prototype chain — required when extending Error in TypeScript
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
