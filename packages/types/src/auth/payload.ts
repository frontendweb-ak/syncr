import type { DeviceInput } from "./device";
import type {
  LoginFailureReason,
  LoginMethod,
  SecurityEventType,
} from "./status";

export type SignInInput = {
  email: string;
  password: string;
  device: DeviceInput;
};

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
};

export interface GoogleAuthInput {
  idToken: string;
  role?: string;
  device: DeviceInput;
}

export type ForgotPasswordInput = {
  email: string;
};

export type ResetPasswordInput = {
  token: string;
  password: string;
};

export type AccessTokenPayload = {
  sub: string;
  sid: string;
  role: string;
  type: "access";
};

export type RefreshTokenPayload = {
  sub: string;
  sid: string;
  type: "refresh";
};

export interface LoginAttemptInput {
  userId?: string;
  deviceId?: string;
  loginIdentifier?: string;
  ipAddress?: string;
  userAgent?: string;
  loginMethod: LoginMethod;
  success: boolean;
  failureReason?: LoginFailureReason;
}

export interface SecurityEventInput {
  userId?: string;
  deviceId?: string;
  eventType: SecurityEventType;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}