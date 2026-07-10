import {
  API_KEY_STATUS,
  API_KEY_TYPE,
  AUTH_PROVIDER,
  DEVICE_STATUS,
  DEVICE_TYPE,
  IMPERSONATION_STATUS,
  LOGIN_FAILURE_REASON,
  LOGIN_METHODS,
  MFA_TYPE,
  PASSWORD_RESET_TOKEN_STATUS,
  SECURITY_EVENT_TYPE,
  USER_STATUS,
  VERIFICATION_STATUS,
} from "@syncr/types";
import { pgEnum } from "drizzle-orm/pg-core";

// user status
export const userStatus = pgEnum("user_status", USER_STATUS);
// Auth provider
export const authProviderEnum = pgEnum("auth_provider", AUTH_PROVIDER);
// Mfa type
export const mfaTypeEnum = pgEnum("mfa_type", MFA_TYPE);

export const deviceStatusEnum = pgEnum("device_status", DEVICE_STATUS);
export const deviceTypeEnum = pgEnum("device_type", DEVICE_TYPE);

export const loginMethodEnum = pgEnum("login_method", LOGIN_METHODS);

export const loginFailureReasonEnum = pgEnum(
  "login_failure_reason",
  LOGIN_FAILURE_REASON,
);

export const securityEventTypeEnum = pgEnum(
  "security_event_type",
  SECURITY_EVENT_TYPE,
);

export const impersonationStatusEnum = pgEnum(
  "impersonation_status",
  IMPERSONATION_STATUS,
);

export const verificationStatusEnum = pgEnum(
  "verification_status",
  VERIFICATION_STATUS,
);

export const passwordResetTokenStatusEnum = pgEnum(
  "password_reset_token_status",
  PASSWORD_RESET_TOKEN_STATUS,
);

export const apiKeyTypeEnum = pgEnum("api_key_type", API_KEY_TYPE);

export const apiKeyStatusEnum = pgEnum("api_key_status", API_KEY_STATUS);
