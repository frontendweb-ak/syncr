import {
  ApiKeyStatus,
  ApiKeyType,
  AuthProvider,
  DeviceStatus,
  DeviceType,
  ImpersonationStatus,
  LoginFailureReason,
  LoginMethod,
  MfaType,
  PasswordResetTokenStatus,
  SecurityEventType,
  UserStatus,
  VerificationStatus,
} from "@syncr/types";
import { pgEnum } from "drizzle-orm/pg-core";

// user status
export const userStatus = pgEnum("user_status", UserStatus);
// Auth provider
export const authProviderEnum = pgEnum("auth_provider", AuthProvider);
// Mfa type
export const mfaTypeEnum = pgEnum("mfa_type", MfaType);

export const deviceStatusEnum = pgEnum("device_status", DeviceStatus);
export const deviceTypeEnum = pgEnum("device_type", DeviceType);

export const loginMethodEnum = pgEnum("login_method", LoginMethod);

export const loginFailureReasonEnum = pgEnum(
  "login_failure_reason",
  LoginFailureReason,
);

export const securityEventTypeEnum = pgEnum(
  "security_event_type",
  SecurityEventType,
);

export const impersonationStatusEnum = pgEnum(
  "impersonation_status",
  ImpersonationStatus,
);

export const verificationStatusEnum = pgEnum(
  "verification_status",
  VerificationStatus,
);

export const passwordResetTokenStatusEnum = pgEnum(
  "password_reset_token_status",
  PasswordResetTokenStatus,
);

export const apiKeyTypeEnum = pgEnum("api_key_type", ApiKeyType);

export const apiKeyStatusEnum = pgEnum("api_key_status", ApiKeyStatus);
