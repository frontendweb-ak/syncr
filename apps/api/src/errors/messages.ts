// ─────────────────────────────────────────────────────────────────
// errors/messages.ts
// ─────────────────────────────────────────────────────────────────
// Default human-readable message for every ErrorCode.
// These are FALLBACK/default copy — factories in errors/catalog/*.ts
// may still pass a more specific message at throw time. Keeping this
// map complete guarantees a safe default even if a call site forgets
// to pass one, and lets clients render something reasonable purely
// from the code (e.g. for i18n lookups keyed by ErrorCode).
//
// Style: sentence case, ends with a period, no interpolation here
// (interpolated messages belong in the factory, e.g. `roleForbidden`).
// ─────────────────────────────────────────────────────────────────
import type { ErrorCode } from "./codes";

export const ErrorMessage: Record<ErrorCode, string> = {
  // HTTP
  BAD_REQUEST: "Bad request.",
  UNAUTHORIZED: "Unauthorized.",
  FORBIDDEN: "Forbidden.",
  NOT_FOUND: "Resource not found.",
  METHOD_NOT_ALLOWED: "Method not allowed.",
  CONFLICT: "Conflict.",
  UNPROCESSABLE: "Unprocessable entity.",
  TOO_MANY_REQUESTS: "Too many requests.",
  INTERNAL_SERVER_ERROR: "Internal server error.",
  SERVICE_UNAVAILABLE: "Service unavailable.",

  // Validation
  VALIDATION_FAILED: "Validation failed.",
  INVALID_PARAM: "Invalid parameter.",
  MISSING_FIELD: "Required field is missing.",

  // Auth: tokens
  AUTH_TOKEN_MISSING: "Authentication token is missing.",
  AUTH_TOKEN_INVALID: "Authentication token is invalid.",
  AUTH_TOKEN_EXPIRED: "Authentication token has expired.",
  AUTH_REFRESH_TOKEN_INVALID: "Refresh token is invalid.",
  AUTH_REFRESH_TOKEN_EXPIRED: "Refresh token has expired.",
  AUTH_REFRESH_TOKEN_REUSED:
    "Refresh token has already been used and was revoked for safety.",

  // Auth: login session
  AUTH_SESSION_NOT_FOUND: "Session not found.",
  AUTH_SESSION_EXPIRED: "Session has expired.",
  AUTH_SESSION_REVOKED: "Session has been revoked.",

  // Auth: OTP
  AUTH_OTP_INVALID: "OTP is invalid.",
  AUTH_OTP_EXPIRED: "OTP has expired.",
  AUTH_OTP_RATE_LIMIT:
    "Too many OTP requests. Please wait before trying again.",
  AUTH_OTP_CREATE_FAILED: "Unable to generate OTP.",
  AUTH_OTP_DELIVERY_FAILED: "Unable to deliver OTP. Please try again.",
  AUTH_OTP_DELIVERY_UNAVAILABLE: "OTP delivery is currently unavailable.",

  // Auth: password
  AUTH_PASSWORD_TOO_WEAK: "Password does not meet strength requirements.",
  AUTH_PASSWORD_REQUIRED: "This account does not have a password set.",
  AUTH_PASSWORD_ALREADY_SET:
    "A password has already been configured for this account.",
  AUTH_CURRENT_PASSWORD_INVALID: "Current password is incorrect.",
  AUTH_RESET_TOKEN_INVALID: "Reset link or code is invalid.",
  AUTH_RESET_TOKEN_EXPIRED: "Reset link or code has expired.",
  AUTH_RESET_TOKEN_ALREADY_USED: "Reset link or code has already been used.",
  AUTH_MUST_RESET_PASSWORD: "You must reset your password before continuing.",

  // Auth: OAuth / providers
  AUTH_OAUTH_TOKEN_INVALID: "Sign-in token is invalid or expired.",
  AUTH_OAUTH_UNAVAILABLE:
    "This sign-in method is currently unavailable. Please try again later.",
  AUTH_INVALID_PROVIDER: "Invalid authentication provider.",
  AUTH_PROVIDER_NOT_FOUND: "Authentication provider not found.",
  AUTH_PROVIDER_CREATE_FAILED: "Failed to link authentication provider.",
  AUTH_PROVIDER_NOT_LINKED: "This provider is not linked to your account.",
  AUTH_PROVIDER_ALREADY_LINKED:
    "This provider is already linked to an account.",

  // Auth: credentials
  AUTH_CREDENTIALS_NOT_FOUND: "Authentication credentials not found.",
  AUTH_CREDENTIALS_CREATE_FAILED:
    "Failed to create authentication credentials.",
  AUTH_INVALID_CREDENTIALS: "Invalid credentials.",

  // Auth: MFA
  AUTH_MFA_ALREADY_ENABLED: "Multi-factor authentication is already enabled.",
  AUTH_MFA_NOT_ENABLED: "Multi-factor authentication is not enabled.",

  // Auth: RBAC
  AUTH_ROLE_FORBIDDEN: "You do not have the required role for this action.",
  AUTH_ROLE_REQUIRED: "Role is required for first registration.",
  AUTH_PERMISSION_DENIED: "Permission denied.",

  // Auth: account / impersonation
  AUTH_ACCOUNT_LOCKED:
    "Account temporarily locked due to too many failed attempts.",
  AUTH_IMPERSONATION_NOT_ACTIVE: "No active impersonation session.",

  // Auth: device session
  AUTH_DEVICE_REVOKED: "Device has been revoked.",
  AUTH_DEVICE_EXPIRED: "Device session has expired.",
  AUTH_DEVICE_REFRESH_TOKEN_MISMATCH:
    "Refresh token does not match the device.",

  // API keys
  API_KEY_NOT_FOUND: "API key not found.",
  API_KEY_INVALID: "API key is invalid.",
  API_KEY_EXPIRED: "API key has expired.",
  API_KEY_REVOKED: "API key has been revoked.",
  API_KEY_CREATE_FAILED: "Failed to create API key.",

  // Device registry
  DEVICE_NOT_FOUND: "Device not found.",
  DEVICE_FINGERPRINT_REQUIRED: "Device fingerprint is required.",
  DEVICE_ALREADY_EXISTS: "Device already registered.",
  DEVICE_CREATE_FAILED: "Failed to register device.",
  DEVICE_LIMIT_EXCEEDED: "Maximum number of active devices reached.",

  // User
  USER_NOT_FOUND: "User not found.",
  USER_ALREADY_EXISTS: "User already exists.",
  USER_CREATE_FAILED: "Failed to create user.",
  USER_INACTIVE: "User account is inactive.",
  USER_EMAIL_ALREADY_EXISTS: "Email already exists.",
  USER_PHONE_ALREADY_EXISTS: "Phone number already exists.",
  USER_EMAIL_NOT_VERIFIED: "Email is not verified.",
  USER_PHONE_NOT_VERIFIED: "Phone number is not verified.",
  ONBOARDING_INCOMPLETE: "Onboarding is incomplete.",

  // Profile
  PROFILE_NOT_FOUND: "Profile not found.",
  PROFILE_ALREADY_EXISTS: "Profile already exists.",
  PROFILE_INCOMPLETE: "Complete your profile before continuing.",

  // Organization
  ORGANIZATION_NOT_FOUND: "Organization not found.",
  ORGANIZATION_ALREADY_EXISTS: "Organization already exists.",
  ORGANIZATION_ACCESS_DENIED: "You do not have access to this organization.",
  ORG_INVITE_NOT_FOUND: "Invite not found.",
  ORG_INVITE_EXPIRED: "This invite has expired.",
  ORG_INVITE_ALREADY_ACCEPTED: "This invite has already been accepted.",
  ORG_MEMBER_NOT_FOUND: "Member not found in this organization.",
  ORG_MEMBER_ALREADY_EXISTS:
    "This user is already a member of the organization.",
  ORG_MEMBER_LAST_OWNER: "An organization must have at least one owner.",

  // Project
  PROJECT_NOT_FOUND: "Project not found.",
  PROJECT_ALREADY_EXISTS: "Project already exists.",
  PROJECT_ACCESS_DENIED: "You do not have access to this project.",
  PROJECT_MEMBER_NOT_FOUND: "Member not found in this project.",
  PROJECT_MEMBER_ALREADY_EXISTS:
    "This user is already a member of the project.",
  PROJECT_ENVIRONMENT_NOT_FOUND: "Environment not found.",
  PROJECT_ENVIRONMENT_ALREADY_EXISTS:
    "An environment with this name already exists.",
  ENVIRONMENT_VARIABLE_NOT_FOUND: "Environment variable not found.",
  ENVIRONMENT_SECRET_NOT_FOUND: "Environment secret not found.",

  // Provider integration
  PROVIDER_CONNECTION_NOT_FOUND: "Provider connection not found.",
  PROVIDER_CONNECTION_ALREADY_EXISTS:
    "A connection to this provider already exists.",
  PROVIDER_CONNECTION_INVALID:
    "Provider connection is invalid or has been revoked.",
  REPOSITORY_NOT_FOUND: "Repository not found.",
  REPOSITORY_ALREADY_LINKED: "This repository is already linked.",
  REPOSITORY_ACCESS_DENIED: "You do not have access to this repository.",

  // Workspace
  WORKSPACE_NOT_FOUND: "Workspace not found.",
  WORKSPACE_ALREADY_EXISTS: "Workspace already exists.",
  WORKSPACE_ACCESS_DENIED: "You do not have access to this workspace.",
  WORKSPACE_LIMIT_EXCEEDED: "Maximum number of workspaces reached.",

  // Sync
  SYNC_FAILED: "Sync failed.",
  SYNC_CONFLICT: "Sync conflict detected.",
  SYNC_IN_PROGRESS: "A sync is already in progress.",
  SYNC_SOURCE_UNAVAILABLE: "Sync source is currently unavailable.",

  // App init
  APP_INIT_FAILED: "Application failed to initialize.",
  APP_CONFIG_MISSING: "Required application configuration is missing.",
  APP_VERSION_UNSUPPORTED:
    "This app version is no longer supported. Please update.",

  // Mentor
  MENTOR_NOT_FOUND: "Mentor not found.",
  MENTOR_NOT_VERIFIED: "Mentor is not yet verified.",
  MENTOR_NOT_ACTIVE: "Mentor is not accepting students.",
  MENTOR_CAPACITY_FULL: "Mentor has no available slots.",
  MENTOR_ALREADY_APPROVED: "Mentor is already approved.",

  // Programme
  PROGRAMME_NOT_FOUND: "Programme not found.",
  PROGRAMME_NOT_PUBLISHED: "Programme is not published.",
  PROGRAMME_TIER_EXISTS: "A programme for this tier already exists.",

  // Requirement
  REQUIREMENT_NOT_FOUND: "Requirement not found.",
  REQUIREMENT_CLOSED: "Requirement is no longer open.",
  REQUIREMENT_EXPIRED: "Requirement has expired.",

  // Application
  APPLICATION_NOT_FOUND: "Application not found.",
  APPLICATION_DUPLICATE: "You have already applied to this requirement.",
  APPLICATION_CLOSED: "Applications are closed for this requirement.",

  // Student
  STUDENT_NOT_FOUND: "Student profile not found.",
  STUDENT_PROFILE_EXISTS: "Student profile already exists.",
  STUDENT_CREATE_FAILED: "Failed to create student profile.",
  STUDENT_REQUIREMENT_NOT_FOUND: "Requirement not found.",
  STUDENT_REQUIREMENT_CLOSED: "This requirement is already closed.",

  // Mentorship
  MENTORSHIP_NOT_FOUND: "Mentorship not found.",
  MENTORSHIP_NOT_ACTIVE: "Mentorship is not active.",
  MENTORSHIP_DUPLICATE:
    "You already have an active mentorship with this mentor.",
  MENTORSHIP_ACCESS_DENIED: "You are not a party to this mentorship.",

  // Milestone
  MILESTONE_NOT_FOUND: "Milestone not found.",
  MILESTONE_LOCKED: "Milestone is locked.",
  MILESTONE_ALREADY_DONE: "Milestone already completed.",

  // Submission / evaluation
  SUBMISSION_NOT_FOUND: "Submission not found.",
  SUBMISSION_ALREADY_EVALUATED: "This submission has already been evaluated.",
  EVALUATION_NOT_FOUND: "Evaluation not found.",

  // Checkout
  CHECKOUT_NOT_FOUND: "Checkout not found.",
  CHECKOUT_ALREADY_COMPLETED: "This checkout has already been completed.",
  CHECKOUT_EXPIRED: "This checkout session has expired.",
  CHECKOUT_ACCESS_DENIED: "You do not have access to this checkout.",
  CHECKOUT_PROGRAMME_NOT_PUBLISHED: "Programme is not available for purchase.",
  CHECKOUT_DUPLICATE: "An active checkout already exists for this programme.",

  // Payment
  PAYMENT_NOT_FOUND: "Payment not found.",
  PAYMENT_AMOUNT_MISMATCH: "Payment amount does not match the expected amount.",
  PAYMENT_FAILED: "Payment failed.",
  PAYMENT_ALREADY_CAPTURED: "Payment has already been captured.",
  PAYMENT_GATEWAY_ERROR: "Payment gateway error.",
  ESCROW_NOT_HELD: "Funds are not currently held in escrow.",
  REFUND_FAILED: "Refund failed.",
  PAYOUT_FAILED: "Payout failed.",

  // Mentor session
  MENTOR_SESSION_NOT_FOUND: "Session not found.",
  MENTOR_SESSION_NOT_SCHEDULED: "Session is not in a scheduled state.",
  MENTOR_SESSION_ALREADY_COMPLETED: "Session has already been completed.",
  MENTOR_SESSION_ACCESS_DENIED: "You do not have access to this session.",

  // Review
  REVIEW_NOT_FOUND: "Review not found.",
  REVIEW_ALREADY_EXISTS: "You have already reviewed this mentorship.",
  REVIEW_ACCESS_DENIED: "You do not have access to this review.",
  REVIEW_MENTORSHIP_NOT_COMPLETE: "You can only review a completed mentorship.",

  // Dispute
  DISPUTE_NOT_FOUND: "Dispute not found.",
  DISPUTE_ALREADY_CLOSED: "This dispute is already closed.",

  // Upload
  FILE_TOO_LARGE: "File exceeds the maximum allowed size.",
  FILE_TYPE_NOT_ALLOWED: "File type is not allowed.",
  UPLOAD_FAILED: "File upload failed.",

  // Database
  DB_UNIQUE_VIOLATION: "Duplicate value violates a unique constraint.",
  DB_FOREIGN_KEY: "Foreign key constraint failed.",
  DB_CONNECTION: "Database connection failed.",
  DB_TIMEOUT: "Database operation timed out.",
};
