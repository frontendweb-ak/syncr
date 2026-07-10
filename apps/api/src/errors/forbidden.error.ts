import { ErrorCode, type ErrorCode as ErrorCodeType } from './codes'
import { HttpException } from './exceptions'

// ── 403 Forbidden ──────────────────────────────────────────────
export class ForbiddenException extends HttpException {
  constructor(
    message = 'Access denied',
    code: ErrorCodeType = ErrorCode.FORBIDDEN,
    details?: unknown,
  ) {
    super(403, code, message, details)
    this.name = 'ForbiddenException'
  }
}
