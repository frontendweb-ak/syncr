import { ErrorCode } from './codes'
import { HttpException } from './exceptions'

// ── 429 Too Many Requests ──────────────────────────────────────
export class RateLimitException extends HttpException {
  constructor(
    message = 'Too many requests. Please slow down.',
    code = ErrorCode.TOO_MANY_REQUESTS,
  ) {
    super(429, code, message)
    this.name = 'RateLimitException'
  }
}
