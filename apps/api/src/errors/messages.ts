import type { ErrorCode } from './codes'

export const ErrorMessage: Record<ErrorCode, string> = {
  BAD_REQUEST: 'Bad request.',
  UNAUTHORIZED: 'Unauthorized.',
  FORBIDDEN: 'Forbidden.',
  NOT_FOUND: 'Resource not found.',
  METHOD_NOT_ALLOWED: 'Method not allowed.',
  CONFLICT: 'Conflict.',
  UNPROCESSABLE: 'Unprocessable entity.',
  TOO_MANY_REQUESTS: 'Too many requests.',
  INTERNAL_SERVER_ERROR: 'Internal server error.',
  SERVICE_UNAVAILABLE: 'Service unavailable.',
  AUTH_INVALID_CREDENTIALS: 'Invalid credentials.',
  AUTH_ROLE_REQUIRED: 'Role is required for first registration.',
  ONBOARDING_INCOMPLETE: 'Onboarding is incomplete',
  VALIDATION_FAILED: 'Validation failed.',
  INVALID_PARAM: 'Invalid parameter.',
  MISSING_FIELD: 'Required field is missing.',

  AUTH_TOKEN_MISSING: 'Authentication token is missing.',
  AUTH_TOKEN_INVALID: 'Authentication token is invalid.',
  AUTH_TOKEN_EXPIRED: 'Authentication token has expired.',

  AUTH_REFRESH_TOKEN_INVALID: 'Refresh token is invalid.',
  AUTH_REFRESH_TOKEN_EXPIRED: 'Refresh token has expired.',

  AUTH_OTP_INVALID: 'OTP is invalid.',
  AUTH_OTP_EXPIRED: 'OTP has expired.',
  AUTH_OTP_RATE_LIMIT: 'Too many OTP requests.',
  AUTH_OTP_CREATE_FAILED: 'Unable to generate OTP.',
  AUTH_OTP_DELIVERY_FAILED: 'Unable to deliver OTP. Please try again.',
  AUTH_OTP_DELIVERY_UNAVAILABLE: 'OTP delivery is currently unavailable.',

  AUTH_ROLE_FORBIDDEN: 'Required role not found.',
  AUTH_PERMISSION_DENIED: 'Permission denied.',

  AUTH_ACCOUNT_LOCKED: 'Account temporarily locked due to too many failed attempts.',
  AUTH_PASSWORD_TOO_WEAK: 'Password does not meet strength requirements.',
  AUTH_PASSWORD_REQUIRED: 'This account does not have a password set.',
  AUTH_CURRENT_PASSWORD_INVALID: 'Current password is incorrect.',
  AUTH_RESET_TOKEN_INVALID: 'Reset link or code is invalid or has expired.',
  AUTH_MUST_RESET_PASSWORD: 'You must reset your password before continuing.',

  AUTH_OAUTH_TOKEN_INVALID: 'Sign-in token is invalid.',
  AUTH_OAUTH_UNAVAILABLE: 'This sign-in method is currently unavailable.',

  AUTH_IMPERSONATION_NOT_ACTIVE: 'No active impersonation session.',

  DEVICE_NOT_FOUND: 'Device not found.',
  DEVICE_ALREADY_EXISTS: 'Device already exists.',
  DEVICE_LIMIT_EXCEEDED: 'Maximum device limit reached.',
  DEVICE_CREATE_FAILED: 'Unable to register device.',

  AUTH_DEVICE_REVOKED: 'Device has been revoked.',
  AUTH_DEVICE_EXPIRED: 'Device session has expired.',
  AUTH_DEVICE_REFRESH_TOKEN_MISMATCH: 'Refresh token does not match the device.',

  AUTH_INVALID_PROVIDER: 'Invalid authentication provider.',

  USER_EMAIL_EXISTS: 'Email already exists',
  USER_PHONE_EXISTS: 'Phone already existed',
  USER_NOT_FOUND: 'User not found.',
  USER_ALREADY_EXISTS: 'User already exists.',
  USER_EMAIL_ALREADY_EXISTS: 'Email already exists.',
  USER_PHONE_ALREADY_EXISTS: 'Phone number already exists.',
  USER_PHONE_NOT_VERIFIED: 'Phone number is not verified.',
  USER_EMAIL_NOT_VERIFIED: 'Email is not verified.',
  USER_INACTIVE: 'User account is inactive.',
  USER_CREATE_FAILED: 'Unable to create user.',

  PROFILE_NOT_FOUND: 'Profile not found.',
  PROFILE_ALREADY_EXISTS: 'Profile already exists.',
  PROFILE_INCOMPLETE: 'Profile is incomplete.',

  MENTOR_NOT_FOUND: 'Mentor not found.',
  MENTOR_NOT_VERIFIED: 'Mentor is not verified.',
  MENTOR_NOT_ACTIVE: 'Mentor is not active.',
  MENTOR_CAPACITY_FULL: 'Mentor capacity is full.',
  MENTOR_ALREADY_APPROVED: 'Mentor is already approved.',

  PROGRAMME_NOT_FOUND: 'Programme not found.',
  PROGRAMME_NOT_PUBLISHED: 'Programme is not published.',
  PROGRAMME_TIER_EXISTS: 'Programme already exists for this tier.',

  REQUIREMENT_NOT_FOUND: 'Requirement not found.',
  REQUIREMENT_CLOSED: 'Requirement is closed.',
  REQUIREMENT_EXPIRED: 'Requirement has expired.',

  APPLICATION_NOT_FOUND: 'Application not found.',
  APPLICATION_DUPLICATE: 'Application already exists.',
  APPLICATION_CLOSED: 'Application is closed.',

  MENTORSHIP_NOT_FOUND: 'Mentorship not found.',
  MENTORSHIP_NOT_ACTIVE: 'Mentorship is not active.',
  MENTORSHIP_DUPLICATE: 'Mentorship already exists.',
  MENTORSHIP_ACCESS_DENIED: 'Access denied for this mentorship.',

  MILESTONE_NOT_FOUND: 'Milestone not found.',
  MILESTONE_LOCKED: 'Milestone is locked.',
  MILESTONE_ALREADY_DONE: 'Milestone already completed.',

  SUBMISSION_NOT_FOUND: 'Submission not found.',
  SUBMISSION_ALREADY_EVALUATED: 'Submission has already been evaluated.',

  EVALUATION_NOT_FOUND: 'Evaluation not found.',

  PAYMENT_FAILED: 'Payment failed.',
  PAYMENT_ALREADY_CAPTURED: 'Payment already captured.',
  PAYMENT_GATEWAY_ERROR: 'Payment gateway error.',
  ESCROW_NOT_HELD: 'Escrow not held.',
  REFUND_FAILED: 'Refund failed.',
  PAYOUT_FAILED: 'Payout failed.',
  PAYMENT_AMOUNT_MISMATCH: 'PAYMENT_AMOUNT_MISMATCH',

  DISPUTE_NOT_FOUND: 'Dispute not found.',
  DISPUTE_ALREADY_CLOSED: 'Dispute is already closed.',

  FILE_TOO_LARGE: 'File is too large.',
  FILE_TYPE_NOT_ALLOWED: 'File type is not allowed.',
  UPLOAD_FAILED: 'File upload failed.',

  DB_UNIQUE_VIOLATION: 'Duplicate value violates a unique constraint.',
  DB_FOREIGN_KEY: 'Foreign key constraint failed.',
  DB_CONNECTION: 'Database connection failed.',
  DB_TIMEOUT: 'Database operation timed out.',

  STUDENT_NOT_FOUND: 'Student profile not found.',
  STUDENT_PROFILE_EXISTS: 'Student profile already exists.',
  STUDENT_CREATE_FAILED: 'Failed to create student profile.',
  STUDENT_REQUIREMENT_NOT_FOUND: 'Requirement not found.',
  STUDENT_REQUIREMENT_CLOSED: 'This requirement is already closed.',

  CHECKOUT_NOT_FOUND: 'Checkout not found.',
  CHECKOUT_ALREADY_COMPLETED: 'This checkout has already been completed.',
  CHECKOUT_EXPIRED: 'This checkout session has expired.',
  CHECKOUT_ACCESS_DENIED: 'You do not have access to this checkout.',
  CHECKOUT_PROGRAMME_NOT_PUBLISHED: 'Programme is not available for purchase.',
  CHECKOUT_DUPLICATE: 'An active checkout already exists for this programme.',
  PAYMENT_NOT_FOUND: 'Payment not found.',
  SESSION_NOT_FOUND: 'Session not found.',
  SESSION_NOT_SCHEDULED: 'Session is not in a scheduled state.',
  SESSION_ALREADY_COMPLETED: 'Session has already been completed.',
  SESSION_ACCESS_DENIED: 'You do not have access to this session.',
  REVIEW_NOT_FOUND: 'Review not found.',
  REVIEW_ALREADY_EXISTS: 'You have already reviewed this mentorship.',
  REVIEW_ACCESS_DENIED: 'You do not have access to this review.',
  REVIEW_MENTORSHIP_NOT_COMPLETE: 'You can only review a completed mentorship.',

  DEVICE_FINGERPRINT_REQUIRED: 'Device fingerprint required',
}
