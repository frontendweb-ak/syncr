export type JwtTokenType = "access" | "refresh";

export type TokenType =
  | "access"
  | "refresh"
  | "email_verification"
  | "password_reset"
  | "magic_link"
  | "mfa_challenge"
  | "github_install_state";

export interface GithubInstallStatePayload {
  userId: string; // userId
  organizationId: string;
  type: "github_install_state";
}
export interface EmailVerificationPayload {
  sub: string;
  type: "email_verification";
}

export interface PasswordResetPayload {
  sub: string;
  type: "password_reset";
}

export interface MagicLinkPayload {
  sub: string;
  type: "magic_link";
}

export interface MfaChallengePayload {
  sub: string;
  sessionId: string;
  deviceId: string;
  type: "mfa_challenge";
}
export type AnyTokenPayload =
  | AccessTokenPayload
  | RefreshTokenPayload
  | EmailVerificationPayload
  | PasswordResetPayload
  | MagicLinkPayload
  | MfaChallengePayload
  | GithubInstallStatePayload;

export interface BaseJwtPayload {
  sub: string;

  /**
   * Session / Device ID.
   */
  sessionId: string;
  deviceId: string;

  /**
   * Global authentication version.
   * Mirrors users.tokenVersion.
   * Changes when:
   * - logout all
   * - password reset
   * - password change
   * - admin force logout
   */
  userTokenVersion: number;

  /**
   * Per-device authentication version.
   * Mirrors devices.tokenVersion.
   * Changes when:
   * - logout current device
   * - device compromise
   * - refresh-token replay
   * - admin revokes one device
   */
  deviceTokenVersion: number;

  type: JwtTokenType;
}

export interface AccessTokenPayload extends BaseJwtPayload {
  type: "access";

  /**
   * Primary role for fast authorization.
   * Full permissions are resolved from the database.
   */
  role: string;

  organizationId: string;
  organizationRole: string;

  impersonatorId?: string;
}

export interface RefreshTokenPayload extends BaseJwtPayload {
  type: "refresh";
}

export interface JwtTokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}
