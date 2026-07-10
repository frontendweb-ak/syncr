import { ErrorCode, type ErrorCode as ErrorCodeType } from './codes'
import { HttpException } from './exceptions'

// ── 401 Unauthorized ───────────────────────────────────────────
export class UnauthorizedException extends HttpException {
  constructor(
    message = 'Authentication required',
    code: ErrorCodeType = ErrorCode.UNAUTHORIZED,
    details?: unknown,
  ) {
    super(401, code, message, details)
    this.name = 'UnauthorizedException'
  }
}
