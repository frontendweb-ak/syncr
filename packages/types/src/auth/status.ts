export const USER_STATUS = [
  "PENDING",
  "ACTIVE",
  "SUSPENDED",
  "BLOCKED",
  "DELETED",
] as const;

export type UserStatus = (typeof USER_STATUS)[number];

export const AUTH_PROVIDER = [
  "PASSWORD",
  "GITHUB",
  "GOOGLE",
  "MICROSOFT",
  "APPLE",
  "OIDC",
  "SAML",
  "PASSKEY",
] as const;
export type AuthProvider = (typeof AUTH_PROVIDER)[number];

export const MFA_TYPE = ["TOTP"] as const;
export type MfaType = (typeof MFA_TYPE)[number];

export const DEVICE_STATUS = ["ACTIVE", "REVOKED", "EXPIRED"] as const;
export type DeviceStatus = (typeof DEVICE_STATUS)[number];

export const DEVICE_TYPE = [
  "IOS",
  "TABLET",
  "ANDROID",
  "WEB",
  "DESKTOP",
] as const;
export type DeviceType = (typeof DEVICE_TYPE)[number];

export const LOGIN_METHODS = [
  "PASSWORD",
  "EMAIL_OTP",
  "PHONE_OTP",
  "GOOGLE",
  "APPLE",
  "GITHUB",
  "MICROSOFT",
  "PASSKEY",
] as const;
export type LoginMethod = (typeof LOGIN_METHODS)[number];

export const LOGIN_FAILURE_REASON = [
  "INVALID_CREDENTIALS",
  "INVALID_OTP",
  "ACCOUNT_SUSPENDED",
  "ACCOUNT_NOT_VERIFIED",
  "ACCOUNT_LOCKED",
  "RATE_LIMITED",
  "PROVIDER_ERROR",
] as const;
export type LoginFailureReason = (typeof LOGIN_FAILURE_REASON)[number];

export const VERIFICATION_STATUS = [
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "SUSPENDED", // approved but temporarily disabled
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUS)[number];

export const IMPERSONATION_STATUS = ["ACTIVE", "ENDED", "EXPIRED"] as const;
export type ImpersonationStatus = (typeof IMPERSONATION_STATUS)[number];

export const SECURITY_EVENT_TYPE = [
  "NEW_DEVICE_LOGIN",
  "PASSWORD_CHANGED",
  "PASSWORD_RESET_REQUESTED",
  "PASSWORD_RESET",
  "EMAIL_CHANGED",
  "PHONE_CHANGED",
  "ACCOUNT_SUSPENDED",
  "ACCOUNT_ACTIVATED",
  "ACCOUNT_LOCKED",
  "ACCOUNT_UNLOCKED",
  "DEVICE_REVOKED",
  "ALL_DEVICES_REVOKED",
  "TOKEN_VERSION_BUMPED",
  "SUSPICIOUS_LOGIN_BLOCKED",
] as const;

export type SecurityEventType = (typeof SECURITY_EVENT_TYPE)[number];

export const PASSWORD_RESET_TOKEN_STATUS = [
  "PENDING",
  "USED",
  "EXPIRED",
  "REVOKED",
] as const;
export type PasswordResetTokenStatus =
  (typeof PASSWORD_RESET_TOKEN_STATUS)[number];

export const API_KEY_TYPE = ["PERSONAL", "ORGANIZATION"] as const;
export type ApiKeyType = (typeof API_KEY_TYPE)[number];

export const API_KEY_STATUS = ["ACTIVE", "REVOKED", "EXPIRED"] as const;
export type ApiKeyStatus = (typeof API_KEY_STATUS)[number];
