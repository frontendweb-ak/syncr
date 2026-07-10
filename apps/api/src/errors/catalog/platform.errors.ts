// ─────────────────────────────────────────────────────────────────
// errors/catalog/platform.errors.ts
// Domains: sync · appInit · validation · upload · database
//
// `sync` and `appInit` are scaffolded ahead of those modules landing —
// extend the factories (and codes.ts / messages.ts) as real call
// sites appear, don't rename the codes already defined here.
// ─────────────────────────────────────────────────────────────────
import { BadRequestException } from '../bad-request.error'
import { ErrorCode } from '../codes'
import { ConflictException } from '../conflict.error'
import { HttpException } from '../exceptions'
import { ServiceUnavailableException } from '../service-unavailable.error'

export const platformErrors = {
  sync: {
    failed: (msg = 'Sync failed') =>
      new HttpException(500, ErrorCode.SYNC_FAILED, msg),
    conflict: (msg = 'Sync conflict detected') =>
      new ConflictException(msg, ErrorCode.SYNC_CONFLICT),
    inProgress: () =>
      new ConflictException('A sync is already in progress', ErrorCode.SYNC_IN_PROGRESS),
    sourceUnavailable: () =>
      new ServiceUnavailableException('Sync source is currently unavailable'),
  },

  appInit: {
    failed: (msg = 'Application failed to initialize') =>
      new HttpException(500, ErrorCode.APP_INIT_FAILED, msg),
    configMissing: (key: string) =>
      new HttpException(
        500,
        ErrorCode.APP_CONFIG_MISSING,
        `Required application configuration is missing: ${key}`,
      ),
    versionUnsupported: () =>
      new BadRequestException(
        'This app version is no longer supported. Please update.',
        ErrorCode.APP_VERSION_UNSUPPORTED,
      ),
  },

  validation: {
    invalidParam: (detail: string) =>
      new BadRequestException(`Invalid parameter: ${detail}`, ErrorCode.INVALID_PARAM),
    missingField: (field: string) =>
      new BadRequestException(
        `Missing required field: ${field}`,
        ErrorCode.MISSING_FIELD,
      ),
    failed: (detail: string) =>
      new BadRequestException(detail, ErrorCode.VALIDATION_FAILED),
  },

  upload: {
    fileTooLarge: (maxMb: number) =>
      new BadRequestException(
        `File exceeds the ${maxMb} MB limit`,
        ErrorCode.FILE_TOO_LARGE,
      ),
    fileTypeNotAllowed: () =>
      new BadRequestException('File type not allowed', ErrorCode.FILE_TYPE_NOT_ALLOWED),
    failed: (msg = 'File upload failed') =>
      new HttpException(500, ErrorCode.UPLOAD_FAILED, msg),
  },

  database: {
    uniqueViolation: (detail?: string) =>
      new ConflictException(
        detail ?? 'Duplicate value violates a unique constraint',
        ErrorCode.DB_UNIQUE_VIOLATION,
      ),
    foreignKey: (detail?: string) =>
      new HttpException(
        409,
        ErrorCode.DB_FOREIGN_KEY,
        detail ?? 'Foreign key constraint failed',
      ),
    connection: () => new ServiceUnavailableException('Database connection failed'),
    timeout: () =>
      new HttpException(504, ErrorCode.DB_TIMEOUT, 'Database operation timed out'),
  },
} as const