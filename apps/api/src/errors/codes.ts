// ─────────────────────────────────────────────────────────────────
// errors/codes.ts
// ─────────────────────────────────────────────────────────────────
// Single source of truth for every error code in the system.
// Codes are:
//   • Namespaced by domain  (AUTH_, MENTOR_, PAYMENT_…)
//   • SCREAMING_SNAKE_CASE  (matches industry convention)
//   • Stable across releases (clients can depend on them)
//   • Never changed — deprecate and add new instead
export const ErrorCode = {
  // ───────────────────────────────────────────────
  // Generic HTTP
  // ───────────────────────────────────────────────
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  CONFLICT: 'CONFLICT',
  UNPROCESSABLE: 'UNPROCESSABLE',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  INTERNAL: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',

  // ───────────────────────────────────────────────
  // Validation
  // ───────────────────────────────────────────────
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_PARAM: 'INVALID_PARAM',
  MISSING_FIELD: 'MISSING_FIELD',

  // ───────────────────────────────────────────────
  // Authentication
  // ───────────────────────────────────────────────
  AUTH_TOKEN_MISSING: 'AUTH_TOKEN_MISSING',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',

  AUTH_REFRESH_TOKEN_INVALID: 'AUTH_REFRESH_TOKEN_INVALID',
  AUTH_REFRESH_TOKEN_EXPIRED: 'AUTH_REFRESH_TOKEN_EXPIRED',

  AUTH_OTP_INVALID: 'AUTH_OTP_INVALID',
  AUTH_OTP_EXPIRED: 'AUTH_OTP_EXPIRED',
  AUTH_OTP_RATE_LIMIT: 'AUTH_OTP_RATE_LIMIT',
  AUTH_OTP_CREATE_FAILED: 'AUTH_OTP_CREATE_FAILED',
  AUTH_OTP_DELIVERY_FAILED: 'AUTH_OTP_DELIVERY_FAILED',
  AUTH_OTP_DELIVERY_UNAVAILABLE: 'AUTH_OTP_DELIVERY_UNAVAILABLE',

  AUTH_ROLE_FORBIDDEN: 'AUTH_ROLE_FORBIDDEN',
  AUTH_PERMISSION_DENIED: 'AUTH_PERMISSION_DENIED',

  AUTH_ACCOUNT_LOCKED: 'AUTH_ACCOUNT_LOCKED',
  AUTH_PASSWORD_TOO_WEAK: 'AUTH_PASSWORD_TOO_WEAK',
  AUTH_PASSWORD_REQUIRED: 'AUTH_PASSWORD_REQUIRED',
  AUTH_CURRENT_PASSWORD_INVALID: 'AUTH_CURRENT_PASSWORD_INVALID',
  AUTH_RESET_TOKEN_INVALID: 'AUTH_RESET_TOKEN_INVALID',
  AUTH_MUST_RESET_PASSWORD: 'AUTH_MUST_RESET_PASSWORD',

  AUTH_OAUTH_TOKEN_INVALID: 'AUTH_OAUTH_TOKEN_INVALID',
  AUTH_OAUTH_UNAVAILABLE: 'AUTH_OAUTH_UNAVAILABLE',

  AUTH_IMPERSONATION_NOT_ACTIVE: 'AUTH_IMPERSONATION_NOT_ACTIVE',

  AUTH_INVALID_PROVIDER: 'AUTH_INVALID_PROVIDER',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',

  // ───────────────────────────────────────────────
  // Device
  // ───────────────────────────────────────────────
  DEVICE_FINGERPRINT_REQUIRED: 'DEVICE_FINGERPRINT_REQUIRED',
  DEVICE_NOT_FOUND: 'DEVICE_NOT_FOUND',
  DEVICE_ALREADY_EXISTS: 'DEVICE_ALREADY_EXISTS',
  DEVICE_LIMIT_EXCEEDED: 'DEVICE_LIMIT_EXCEEDED',

  DEVICE_CREATE_FAILED: 'DEVICE_CREATE_FAILED',

  AUTH_DEVICE_REVOKED: 'AUTH_DEVICE_REVOKED',
  AUTH_DEVICE_EXPIRED: 'AUTH_DEVICE_EXPIRED',
  AUTH_DEVICE_REFRESH_TOKEN_MISMATCH: 'AUTH_DEVICE_REFRESH_TOKEN_MISMATCH',
  AUTH_ROLE_REQUIRED: 'AUTH_ROLE_REQUIRED',
  // ───────────────────────────────────────────────
  // User
  // ───────────────────────────────────────────────
  USER_EMAIL_EXISTS: 'USER_EMAIL_EXISTS',
  USER_PHONE_EXISTS: 'USER_PHONE_EXISTS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  ONBOARDING_INCOMPLETE: 'ONBOARDING_INCOMPLETE',
  USER_EMAIL_ALREADY_EXISTS: 'USER_EMAIL_ALREADY_EXISTS',
  USER_PHONE_ALREADY_EXISTS: 'USER_PHONE_ALREADY_EXISTS',

  USER_PHONE_NOT_VERIFIED: 'USER_PHONE_NOT_VERIFIED',
  USER_EMAIL_NOT_VERIFIED: 'USER_EMAIL_NOT_VERIFIED',

  USER_INACTIVE: 'USER_INACTIVE',

  USER_CREATE_FAILED: 'USER_CREATE_FAILED',

  // ───────────────────────────────────────────────
  // Profile
  // ───────────────────────────────────────────────
  PROFILE_NOT_FOUND: 'PROFILE_NOT_FOUND',
  PROFILE_ALREADY_EXISTS: 'PROFILE_ALREADY_EXISTS',
  PROFILE_INCOMPLETE: 'PROFILE_INCOMPLETE',

  // ───────────────────────────────────────────────
  // Mentor
  // ───────────────────────────────────────────────
  MENTOR_NOT_FOUND: 'MENTOR_NOT_FOUND',
  MENTOR_NOT_VERIFIED: 'MENTOR_NOT_VERIFIED',
  MENTOR_NOT_ACTIVE: 'MENTOR_NOT_ACTIVE',
  MENTOR_CAPACITY_FULL: 'MENTOR_CAPACITY_FULL',
  MENTOR_ALREADY_APPROVED: 'MENTOR_ALREADY_APPROVED',

  // ───────────────────────────────────────────────
  // Programme
  // ───────────────────────────────────────────────
  PROGRAMME_NOT_FOUND: 'PROGRAMME_NOT_FOUND',
  PROGRAMME_NOT_PUBLISHED: 'PROGRAMME_NOT_PUBLISHED',
  PROGRAMME_TIER_EXISTS: 'PROGRAMME_TIER_EXISTS',

  // ───────────────────────────────────────────────
  // Requirement
  // ───────────────────────────────────────────────
  REQUIREMENT_NOT_FOUND: 'REQUIREMENT_NOT_FOUND',
  REQUIREMENT_CLOSED: 'REQUIREMENT_CLOSED',
  REQUIREMENT_EXPIRED: 'REQUIREMENT_EXPIRED',

  // ───────────────────────────────────────────────
  // Application
  // ───────────────────────────────────────────────
  APPLICATION_NOT_FOUND: 'APPLICATION_NOT_FOUND',
  APPLICATION_DUPLICATE: 'APPLICATION_DUPLICATE',
  APPLICATION_CLOSED: 'APPLICATION_CLOSED',

  // ───────────────────────────────────────────────
  // Mentorship
  // ───────────────────────────────────────────────
  MENTORSHIP_NOT_FOUND: 'MENTORSHIP_NOT_FOUND',
  MENTORSHIP_NOT_ACTIVE: 'MENTORSHIP_NOT_ACTIVE',
  MENTORSHIP_DUPLICATE: 'MENTORSHIP_DUPLICATE',
  MENTORSHIP_ACCESS_DENIED: 'MENTORSHIP_ACCESS_DENIED',

  // ───────────────────────────────────────────────
  // Milestone
  // ───────────────────────────────────────────────
  MILESTONE_NOT_FOUND: 'MILESTONE_NOT_FOUND',
  MILESTONE_LOCKED: 'MILESTONE_LOCKED',
  MILESTONE_ALREADY_DONE: 'MILESTONE_ALREADY_DONE',

  // ───────────────────────────────────────────────
  // Submission
  // ───────────────────────────────────────────────
  SUBMISSION_NOT_FOUND: 'SUBMISSION_NOT_FOUND',
  SUBMISSION_ALREADY_EVALUATED: 'SUBMISSION_ALREADY_EVALUATED',

  EVALUATION_NOT_FOUND: 'EVALUATION_NOT_FOUND',

  // ───────────────────────────────────────────────
  // Payment
  // ───────────────────────────────────────────────
  PAYMENT_AMOUNT_MISMATCH: 'PAYMENT_AMOUNT_MISMATCH',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_ALREADY_CAPTURED: 'PAYMENT_ALREADY_CAPTURED',
  PAYMENT_GATEWAY_ERROR: 'PAYMENT_GATEWAY_ERROR',
  ESCROW_NOT_HELD: 'ESCROW_NOT_HELD',
  REFUND_FAILED: 'REFUND_FAILED',
  PAYOUT_FAILED: 'PAYOUT_FAILED',

  // ───────────────────────────────────────────────
  // Dispute
  // ───────────────────────────────────────────────
  DISPUTE_NOT_FOUND: 'DISPUTE_NOT_FOUND',
  DISPUTE_ALREADY_CLOSED: 'DISPUTE_ALREADY_CLOSED',

  // ───────────────────────────────────────────────
  // Upload
  // ───────────────────────────────────────────────
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_TYPE_NOT_ALLOWED: 'FILE_TYPE_NOT_ALLOWED',
  UPLOAD_FAILED: 'UPLOAD_FAILED',

  // ───────────────────────────────────────────────
  // Database
  // ───────────────────────────────────────────────
  DB_UNIQUE_VIOLATION: 'DB_UNIQUE_VIOLATION',
  DB_FOREIGN_KEY: 'DB_FOREIGN_KEY',
  DB_CONNECTION: 'DB_CONNECTION',
  DB_TIMEOUT: 'DB_TIMEOUT',

  // ───────────────────────────────────────────────
  // Student
  // ───────────────────────────────────────────────
  STUDENT_NOT_FOUND: 'STUDENT_NOT_FOUND',
  STUDENT_PROFILE_EXISTS: 'STUDENT_PROFILE_EXISTS',
  STUDENT_CREATE_FAILED: 'STUDENT_CREATE_FAILED',
  STUDENT_REQUIREMENT_NOT_FOUND: 'STUDENT_REQUIREMENT_NOT_FOUND',
  STUDENT_REQUIREMENT_CLOSED: 'STUDENT_REQUIREMENT_CLOSED',

  // ── Checkout ──────────────────────────────────────────────────────────────
  CHECKOUT_NOT_FOUND: 'CHECKOUT_NOT_FOUND',
  CHECKOUT_ALREADY_COMPLETED: 'CHECKOUT_ALREADY_COMPLETED',
  CHECKOUT_EXPIRED: 'CHECKOUT_EXPIRED',
  CHECKOUT_ACCESS_DENIED: 'CHECKOUT_ACCESS_DENIED',
  CHECKOUT_PROGRAMME_NOT_PUBLISHED: 'CHECKOUT_PROGRAMME_NOT_PUBLISHED',
  CHECKOUT_DUPLICATE: 'CHECKOUT_DUPLICATE',

  // ── Payment ───────────────────────────────────────────────────────────────
  PAYMENT_NOT_FOUND: 'PAYMENT_NOT_FOUND',

  // ── Session ───────────────────────────────────────────────────────────────
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  SESSION_NOT_SCHEDULED: 'SESSION_NOT_SCHEDULED',
  SESSION_ALREADY_COMPLETED: 'SESSION_ALREADY_COMPLETED',
  SESSION_ACCESS_DENIED: 'SESSION_ACCESS_DENIED',

  // ── Review ────────────────────────────────────────────────────────────────
  REVIEW_NOT_FOUND: 'REVIEW_NOT_FOUND',
  REVIEW_ALREADY_EXISTS: 'REVIEW_ALREADY_EXISTS',
  REVIEW_ACCESS_DENIED: 'REVIEW_ACCESS_DENIED',
  REVIEW_MENTORSHIP_NOT_COMPLETE: 'REVIEW_MENTORSHIP_NOT_COMPLETE',
} as const

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode]
