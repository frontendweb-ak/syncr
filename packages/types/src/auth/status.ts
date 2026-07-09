export const UserStatus = [
  "PENDING",
  "ACTIVE",
  "SUSPENDED",
  "BLOCKED",
  "DELETED",
] as const;
export type UserStatus = (typeof UserStatus)[number];
export const AuthProvider = [
  "PASSWORD",
  "GITHUB",
  "GOOGLE",
  "MICROSOFT",
  "APPLE",
  "OIDC",
  "SAML",
  "PASSKEY",
] as const;
export type AuthProvider = (typeof AuthProvider)[number];
export const MfaType = ["TOTP"] as const;
export const DeviceStatus = ["ACTIVE", "REVOKED", "EXPIRED"] as const;
export const DeviceType = ["MOBILE", "TABLET", "WEB"] as const;
export const LoginMethod = [
  "PHONE_OTP",
  "EMAIL_OTP",
  "EMAIL_PASSWORD",
  "GOOGLE",
  "APPLE",
  "SUPABASE",
] as const;
export const LoginFailureReason = [
  "INVALID_CREDENTIALS",
  "INVALID_OTP",
  "ACCOUNT_SUSPENDED",
  "ACCOUNT_NOT_VERIFIED",
  "ACCOUNT_LOCKED",
  "RATE_LIMITED",
  "PROVIDER_ERROR",
] as const;
export const VerificationStatus = [
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "SUSPENDED", // approved but temporarily disabled
] as const;
export const ImpersonationStatus = ["ACTIVE", "ENDED", "EXPIRED"] as const;
export const SecurityEventType = [
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
export const PasswordResetTokenStatus = [
  "PENDING",
  "USED",
  "EXPIRED",
  "REVOKED",
] as const;

export const ApiKeyType = ["PERSONAL", "ORGANIZATION"] as const;
export const ApiKeyStatus = ["ACTIVE", "REVOKED", "EXPIRED"] as const;