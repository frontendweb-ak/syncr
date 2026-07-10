import { ErrorCode, type ErrorCode as ErrorCodeType } from './codes'
import { HttpException } from './exceptions'

// ── 409 Conflict ───────────────────────────────────────────────
export class ConflictException extends HttpException {
  constructor(message = 'Conflict', code: ErrorCodeType = ErrorCode.CONFLICT, details?: unknown) {
    super(409, code, message, details)
    this.name = 'ConflictException'
  }
}
