// ─────────────────────────────────────────────────────────────────
// errors/catalog/identity.errors.ts
// Domains: auth · device · apiKey · user · profile
// ─────────────────────────────────────────────────────────────────
import { BadRequestException } from "../bad-request.error";
import { ErrorCode } from "../codes";
import { ConflictException } from "../conflict.error";
import { HttpException } from "../exceptions";
import { ForbiddenException } from "../forbidden.error";
import { NotFoundException } from "../not-found.error";
import { RateLimitException } from "../rate-limit.error";
import { ServiceUnavailableException } from "../service-unavailable.error";
import { UnauthorizedException } from "../un-authrized-error.error";

export const identityErrors = {
  auth: {
    // tokens
    tokenMissing: () =>
      new UnauthorizedException(
        "Missing or malformed token",
        ErrorCode.AUTH_TOKEN_MISSING,
      ),
    tokenInvalid: () =>
      new UnauthorizedException("Invalid token", ErrorCode.AUTH_TOKEN_INVALID),
    tokenExpired: () =>
      new UnauthorizedException(
        "Token has expired",
        ErrorCode.AUTH_TOKEN_EXPIRED,
      ),
    refreshTokenInvalid: () =>
      new UnauthorizedException(
        "Refresh token is invalid",
        ErrorCode.AUTH_REFRESH_TOKEN_INVALID,
      ),
    refreshTokenExpired: () =>
      new UnauthorizedException(
        "Refresh token has expired",
        ErrorCode.AUTH_REFRESH_TOKEN_EXPIRED,
      ),
    refreshTokenReused: () =>
      new UnauthorizedException(
        "Refresh token has already been used and was revoked for safety",
        ErrorCode.AUTH_REFRESH_TOKEN_REUSED,
      ),

    // login session
    sessionNotFound: () =>
      new NotFoundException("Session", ErrorCode.AUTH_SESSION_NOT_FOUND),
    sessionExpired: () =>
      new UnauthorizedException(
        "Session has expired",
        ErrorCode.AUTH_SESSION_EXPIRED,
      ),
    sessionRevoked: () =>
      new UnauthorizedException(
        "Session has been revoked",
        ErrorCode.AUTH_SESSION_REVOKED,
      ),

    // OTP
    otpInvalid: () =>
      new BadRequestException("Invalid OTP", ErrorCode.AUTH_OTP_INVALID),
    otpExpired: () =>
      new BadRequestException(
        "OTP has expired. Request a new one.",
        ErrorCode.AUTH_OTP_EXPIRED,
      ),
    otpRateLimit: () =>
      new RateLimitException(
        "Too many OTP requests. Please wait before trying again.",
      ),
    otpCreateFailed: () =>
      new HttpException(
        500,
        ErrorCode.AUTH_OTP_CREATE_FAILED,
        "Failed to generate OTP",
      ),
    otpDeliveryFailed: () =>
      new HttpException(
        502,
        ErrorCode.AUTH_OTP_DELIVERY_FAILED,
        "Unable to deliver OTP. Please try again.",
      ),
    otpDeliveryUnavailable: () =>
      new ServiceUnavailableException("OTP delivery is currently unavailable"),

    // password
    passwordTooWeak: (reason: string) =>
      new HttpException(422, ErrorCode.AUTH_PASSWORD_TOO_WEAK, reason),
    passwordRequired: () =>
      new BadRequestException(
        "This account does not have a password set",
        ErrorCode.AUTH_PASSWORD_REQUIRED,
      ),
    passwordAlreadySet: () =>
      new ConflictException(
        "A password has already been configured for this account",
        ErrorCode.AUTH_PASSWORD_ALREADY_SET,
      ),
    currentPasswordInvalid: () =>
      new BadRequestException(
        "Current password is incorrect",
        ErrorCode.AUTH_CURRENT_PASSWORD_INVALID,
      ),
    resetTokenInvalid: () =>
      new BadRequestException(
        "Reset link or code is invalid",
        ErrorCode.AUTH_RESET_TOKEN_INVALID,
      ),
    resetTokenExpired: () =>
      new BadRequestException(
        "Reset link or code has expired",
        ErrorCode.AUTH_RESET_TOKEN_EXPIRED,
      ),
    resetTokenAlreadyUsed: () =>
      new BadRequestException(
        "Reset link or code has already been used",
        ErrorCode.AUTH_RESET_TOKEN_ALREADY_USED,
      ),
    mustResetPassword: () =>
      new UnauthorizedException(
        "You must reset your password before continuing",
        ErrorCode.AUTH_MUST_RESET_PASSWORD,
      ),

    // OAuth / providers
    oauthUnavailable: () =>
      new UnauthorizedException(
        "This sign-in method is currently unavailable. Please try again later.",
        ErrorCode.AUTH_OAUTH_UNAVAILABLE,
      ),
    oauthTokenInvalid: () =>
      new UnauthorizedException(
        "Invalid or expired sign-in token",
        ErrorCode.AUTH_OAUTH_TOKEN_INVALID,
      ),
    invalidProvider: () =>
      new BadRequestException(
        "Invalid authentication provider or provider ID",
        ErrorCode.AUTH_INVALID_PROVIDER,
      ),
    providerNotFound: () =>
      new NotFoundException(
        "Authentication provider",
        ErrorCode.AUTH_PROVIDER_NOT_FOUND,
      ),
    providerCreateFailed: () =>
      new HttpException(
        500,
        ErrorCode.AUTH_PROVIDER_CREATE_FAILED,
        "Failed to link authentication provider",
      ),
    providerNotLinked: () =>
      new BadRequestException(
        "This provider is not linked to your account",
        ErrorCode.AUTH_PROVIDER_NOT_LINKED,
      ),
    providerAlreadyLinked: () =>
      new ConflictException(
        "This provider is already linked to an account",
        ErrorCode.AUTH_PROVIDER_ALREADY_LINKED,
      ),

    // credentials
    credentialsAlreadyExists: () =>
      new ConflictException(
        "Credential already existed",
        ErrorCode.AUTH_CREDENTIALS_ALREADY_EXIST,
      ),
    credentialsNotFound: () =>
      new NotFoundException(
        "Authentication credentials",
        ErrorCode.AUTH_CREDENTIALS_NOT_FOUND,
      ),
    credentialsCreateFailed: () =>
      new HttpException(
        500,
        ErrorCode.AUTH_CREDENTIALS_CREATE_FAILED,
        "Failed to create authentication credentials",
      ),

    invalidCredentials: () =>
      new UnauthorizedException(
        "Invalid credentials",
        ErrorCode.AUTH_INVALID_CREDENTIALS,
      ),

    // MFA
    mfaAlreadyEnabled: () =>
      new ConflictException(
        "Multi-factor authentication is already enabled",
        ErrorCode.AUTH_MFA_ALREADY_ENABLED,
      ),
    mfaNotEnabled: () =>
      new BadRequestException(
        "Multi-factor authentication is not enabled",
        ErrorCode.AUTH_MFA_NOT_ENABLED,
      ),

    // RBAC
    roleForbidden: (role: string) =>
      new ForbiddenException(
        `This action requires role: ${role}`,
        ErrorCode.AUTH_ROLE_FORBIDDEN,
      ),
    roleRequired: () =>
      new BadRequestException(
        "Role is required for first registration",
        ErrorCode.AUTH_ROLE_REQUIRED,
      ),
    permissionDenied: (permission: string) =>
      new ForbiddenException(
        `Missing permission: ${permission}`,
        ErrorCode.AUTH_PERMISSION_DENIED,
      ),

    // account / impersonation
    accountLocked: () =>
      new ForbiddenException(
        "Account temporarily locked due to too many failed attempts",
        ErrorCode.AUTH_ACCOUNT_LOCKED,
      ),
    impersonationNotActive: () =>
      new BadRequestException(
        "No active impersonation session",
        ErrorCode.AUTH_IMPERSONATION_NOT_ACTIVE,
      ),

    // device session
    deviceRevoked: () =>
      new UnauthorizedException(
        "Device has been revoked",
        ErrorCode.AUTH_DEVICE_REVOKED,
      ),
    deviceExpired: () =>
      new UnauthorizedException(
        "Device session has expired",
        ErrorCode.AUTH_DEVICE_EXPIRED,
      ),
    deviceRefreshTokenMismatch: () =>
      new UnauthorizedException(
        "Refresh token does not match the device",
        ErrorCode.AUTH_DEVICE_REFRESH_TOKEN_MISMATCH,
      ),

    loginHistoryCreateFailed: () =>
      new HttpException(
        500,
        ErrorCode.AUTH_LOGIN_HISTORY_CREATE_FAILED,
        "Failed to create authentication credentials",
      ),

    securityEventCreateFailed: () =>
      new HttpException(
        500,
        ErrorCode.AUTH_SECURITY_EVENT_CREATE_FAILED,
        "Failed to create security event",
      ),
  },

  apiKey: {
    notFound: () =>
      new NotFoundException("API key", ErrorCode.API_KEY_NOT_FOUND),
    invalid: () =>
      new UnauthorizedException(
        "API key is invalid",
        ErrorCode.API_KEY_INVALID,
      ),
    expired: () =>
      new UnauthorizedException(
        "API key has expired",
        ErrorCode.API_KEY_EXPIRED,
      ),
    revoked: () =>
      new UnauthorizedException(
        "API key has been revoked",
        ErrorCode.API_KEY_REVOKED,
      ),
    createFailed: () =>
      new HttpException(
        500,
        ErrorCode.API_KEY_CREATE_FAILED,
        "Failed to create API key",
      ),
  },

  device: {
    revoked: () =>
      new UnauthorizedException(
        "Device has been revoked",
        ErrorCode.AUTH_DEVICE_REVOKED,
      ),
    notFound: () => new NotFoundException("Device", ErrorCode.DEVICE_NOT_FOUND),
    fingerprintRequired: () =>
      new BadRequestException(
        "Device fingerprint is required",
        ErrorCode.DEVICE_FINGERPRINT_REQUIRED,
      ),
    alreadyExists: () =>
      new ConflictException(
        "Device already registered",
        ErrorCode.DEVICE_ALREADY_EXISTS,
      ),
    createFailed: () =>
      new HttpException(
        500,
        ErrorCode.DEVICE_CREATE_FAILED,
        "Failed to register device",
      ),
    limitExceeded: (limit: number) =>
      new ConflictException(
        `Maximum ${limit} active devices allowed`,
        ErrorCode.DEVICE_LIMIT_EXCEEDED,
      ),
  },

  user: {
    notFound: () => new NotFoundException("User", ErrorCode.USER_NOT_FOUND),
    alreadyExists: () =>
      new ConflictException(
        "User already exists",
        ErrorCode.USER_ALREADY_EXISTS,
      ),
    createFailed: () =>
      new HttpException(
        500,
        ErrorCode.USER_CREATE_FAILED,
        "Failed to create user",
      ),
    inactive: () =>
      new ForbiddenException(
        "User account is inactive",
        ErrorCode.USER_INACTIVE,
      ),
    emailAlreadyExists: () =>
      new ConflictException(
        "Email already exists",
        ErrorCode.USER_EMAIL_ALREADY_EXISTS,
      ),
    phoneAlreadyExists: () =>
      new ConflictException(
        "Phone already exists",
        ErrorCode.USER_PHONE_ALREADY_EXISTS,
      ),
    emailNotVerified: () =>
      new ForbiddenException(
        "Email is not verified",
        ErrorCode.USER_EMAIL_NOT_VERIFIED,
      ),
    phoneNotVerified: () =>
      new ForbiddenException(
        "Phone number is not verified",
        ErrorCode.USER_PHONE_NOT_VERIFIED,
      ),
    onboardingIncomplete: () =>
      new BadRequestException(
        "Onboarding is incomplete",
        ErrorCode.ONBOARDING_INCOMPLETE,
      ),
    invalidAuthProvider: () =>
      new BadRequestException(
        "Invalid authentication provider or provider ID",
        ErrorCode.AUTH_INVALID_PROVIDER,
      ),
  },

  profile: {
    notFound: () =>
      new NotFoundException("Profile", ErrorCode.PROFILE_NOT_FOUND),
    alreadyExists: () =>
      new ConflictException(
        "Profile already exists",
        ErrorCode.PROFILE_ALREADY_EXISTS,
      ),
    incomplete: () =>
      new BadRequestException(
        "Complete your profile before continuing.",
        ErrorCode.PROFILE_INCOMPLETE,
      ),
  },
} as const;
