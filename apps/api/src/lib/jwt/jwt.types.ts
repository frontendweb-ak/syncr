export type JwtTokenType = "access" | "refresh";

export interface BaseJwtPayload {
  sub: string;
  sessionId: string;
  deviceId: string;
  tokenVersion: number;
  type: JwtTokenType;
}

export interface AccessTokenPayload extends BaseJwtPayload {
  type: "access";
  /**
   * Primary role for quick authorization.
   * Full RBAC comes from DB.
   */
  role: string;

  /**
   * Optional impersonation context.
   */
  impersonatorId?: string;
}

export interface RefreshTokenPayload extends BaseJwtPayload {
  type: "refresh";
}
