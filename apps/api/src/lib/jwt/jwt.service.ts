import {
  decodeJwt,
  errors as JoseErrors,
  type JWTPayload,
  jwtVerify,
  SignJWT,
} from "jose";
import type { AppConfig } from "../../config";
import { Errors } from "../../errors";
import type { AccessTokenPayload, RefreshTokenPayload } from "./jwt.types";

const ALGORITHM = "HS256";
type AnyTokenPayload = AccessTokenPayload | RefreshTokenPayload;
export class JwtService {
  private readonly accessSecret: Uint8Array;
  private readonly refreshSecret: Uint8Array;

  constructor(private readonly config: AppConfig) {
    this.accessSecret = new TextEncoder().encode(config.ACCESS_TOKEN_SECRET);
    this.refreshSecret = new TextEncoder().encode(config.REFRESH_TOKEN_SECRET);
  }

  static isAccessToken(
    payload: AnyTokenPayload,
  ): payload is AccessTokenPayload {
    return payload.type === "access";
  }

  static isRefreshToken(
    payload: AnyTokenPayload,
  ): payload is RefreshTokenPayload {
    return payload.type === "refresh";
  }

  async createTokenPair(payload: Omit<AccessTokenPayload, "type">) {
    const accessToken = await this.signAccessToken({
      ...payload,
      type: "access",
    });

    const refreshToken = await this.signRefreshToken({
      sub: payload.sub,
      sessionId: payload.sessionId,
      deviceId: payload.deviceId,
      tokenVersion: payload.tokenVersion,
      type: "refresh",
    });

    return {
      accessToken,
      refreshToken,
    };
  }
  /**
   * Create Access Token
   */
  async signAccessToken(payload: AccessTokenPayload): Promise<string> {
    return new SignJWT({
      sessionId: payload.sessionId,
      deviceId: payload.deviceId,
      tokenVersion: payload.tokenVersion,
      role: payload.role,
      type: payload.type,
      ...(payload.impersonatorId
        ? { impersonatorId: payload.impersonatorId }
        : {}),
    })
      .setProtectedHeader({ alg: ALGORITHM, typ: "JWT" })
      .setSubject(payload.sub)
      .setIssuer(this.config.JWT_ISSUER)
      .setAudience(this.config.JWT_AUDIENCE)
      .setIssuedAt()

      .setExpirationTime(this.config.ACCESS_TOKEN_EXPIRES_IN)
      .sign(this.accessSecret);
  }

  /**
   * Create Refresh Token
   */
  async signRefreshToken(payload: RefreshTokenPayload): Promise<string> {
    return new SignJWT({
      sessionId: payload.sessionId,
      deviceId: payload.deviceId,
      tokenVersion: payload.tokenVersion,
      type: payload.type,
    })
      .setProtectedHeader({
        alg: ALGORITHM,
        typ: "JWT",
      })
      .setSubject(payload.sub)
      .setIssuer(this.config.JWT_ISSUER)
      .setAudience(this.config.JWT_AUDIENCE)
      .setIssuedAt()
      .setExpirationTime(this.config.REFRESH_TOKEN_EXPIRES_IN)
      .sign(this.refreshSecret);
  }

  /**
   * Verify Access Token
   */
  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    try {
      const { payload } = await jwtVerify(token, this.accessSecret, {
        issuer: this.config.JWT_ISSUER,
        audience: this.config.JWT_AUDIENCE,
        algorithms: [ALGORITHM],
      });

      if (payload.type !== "access") {
        throw Errors.auth.tokenInvalid();
      }

      if (!payload.sub) throw Errors.auth.tokenInvalid();

      return {
        sub: payload.sub,
        sessionId: payload.sessionId as string,
        deviceId: payload.deviceId as string,
        tokenVersion: payload.tokenVersion as number,
        role: payload.role as string,
        ...(payload.impersonatorId
          ? { impersonatorId: payload.impersonatorId as string }
          : {}),
        type: "access",
      };
    } catch (error) {
      this.handleJoseError(error);
    }
  }

  /**
   * Verify Refresh Token
   */
  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      const { payload } = await jwtVerify(token, this.refreshSecret, {
        issuer: this.config.JWT_ISSUER,
        audience: this.config.JWT_AUDIENCE,
        algorithms: [ALGORITHM],
      });

      if (payload.type !== "refresh") {
        throw Errors.auth.tokenInvalid();
      }
      if (!payload.sub) throw Errors.auth.tokenInvalid();
      return {
        sub: payload.sub,
        sessionId: payload.sessionId as string,
        deviceId: payload.deviceId as string,
        tokenVersion: payload.tokenVersion as number,
        type: "refresh",
      };
    } catch (error) {
      this.handleJoseError(error);
    }
  }

  /**
   * Decode token without verifying signature.
   * Never use this for authentication.
   */
  static decode<T = JWTPayload>(token: string): T {
    return decodeJwt(token) as T;
  }

  /**
   * Extract Bearer token
   */
  static extractBearerToken(header?: string): string {
    if (!header) {
      throw Errors.auth.tokenMissing();
    }

    if (!header.startsWith("Bearer ")) {
      throw Errors.auth.tokenMissing();
    }

    return header.substring(7).trim();
  }

  /**
   * Convert JOSE errors into application errors.
   */
  private handleJoseError(error: unknown): never {
    if (error instanceof JoseErrors.JWTExpired) {
      throw Errors.auth.tokenExpired();
    }

    if (
      error instanceof JoseErrors.JWTInvalid ||
      error instanceof JoseErrors.JWTClaimValidationFailed ||
      error instanceof JoseErrors.JWSSignatureVerificationFailed
    ) {
      throw Errors.auth.tokenInvalid();
    }

    throw error;
  }
}
