export type JwtTokenType = "access" | "refresh";

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

  impersonatorId?: string;
}

export interface RefreshTokenPayload extends BaseJwtPayload {
  type: "refresh";
}