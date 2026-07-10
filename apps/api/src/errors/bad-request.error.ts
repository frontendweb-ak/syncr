import { ErrorCode, type ErrorCode as ErrorCodeType } from './codes'
import { HttpException } from './exceptions'

// ── 400 Bad Request ────────────────────────────────────────────
export class BadRequestException extends HttpException {
  constructor(
    message = 'Bad request',
    code: ErrorCodeType = ErrorCode.BAD_REQUEST,
    details?: unknown,
  ) {
    super(400, code, message, details)
    this.name = 'BadRequestException'
  }
}
