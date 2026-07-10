import { ErrorCode, type ErrorCode as ErrorCodeType } from './codes'
import { HttpException } from './exceptions'

// ── 404 Not Found ──────────────────────────────────────────────
export class NotFoundException extends HttpException {
  constructor(resource = 'Resource', code: ErrorCodeType = ErrorCode.NOT_FOUND, message?: string) {
    super(404, code, message ?? `${resource} not found`)

    this.name = 'NotFoundException'
  }
}
