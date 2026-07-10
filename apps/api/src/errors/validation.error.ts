// ── 422 Unprocessable Entity ───────────────────────────────────
// Used for Zod validation errors.
import { ErrorCode } from './codes'
import { HttpException } from './exceptions'

export class ValidationException extends HttpException<Record<string, string[]>> {
  constructor(fields: Record<string, string[]>) {
    super(422, ErrorCode.VALIDATION_FAILED, 'Validation failed', fields)

    this.name = 'ValidationException'
  }
}
