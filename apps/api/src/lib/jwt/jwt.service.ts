import {
  decodeJwt,
  errors as JoseErrors,
  type JWTPayload,
  jwtVerify,
  SignJWT,
} from "jose";
import { type AppConfig, JWT } from "../../config";
import { Errors } from "../../errors";
import type {
  AccessTokenPayload,
  AnyTokenPayload,
  EmailVerificationPayload,
  MfaChallengePayload,
  RefreshTokenPayload,
} from "./jwt.types";

const ALGORITHM = JWT.ALGORITHM;

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
    console.log("accessToken", accessToken);

    const refreshToken = await this.signRefreshToken({
      sub: payload.sub,
      sessionId: payload.sessionId,
      deviceId: payload.deviceId,
      userTokenVersion: payload.userTokenVersion,
      deviceTokenVersion: payload.deviceTokenVersion,
      type: "refresh",
    });

    const expiresAt = Date.now() + JWT.EXPIRY_SECONDS.ACCESS * 1000;

    return {
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      expiresIn: JWT.EXPIRY_SECONDS.ACCESS,
      expiresAt,
    };
  }
  /**
   * Create Access Token
   */
  async signAccessToken(payload: AccessTokenPayload) {
    return new SignJWT({
      sessionId: payload.sessionId,
      deviceId: payload.deviceId,
      userTokenVersion: payload.userTokenVersion,
      deviceTokenVersion: payload.deviceTokenVersion,
      role: payload.role,
      organizationId: payload.organizationId,
      organizationRole: payload.organizationRole,
      type: payload.type,
      ...(payload.impersonatorId
        ? { impersonatorId: payload.impersonatorId }
        : {}),
    })
      .setProtectedHeader({ alg: ALGORITHM, typ: JWT.TYPE, kid: JWT.KEY_ID })
      .setSubject(payload.sub)
      .setIssuer(this.config.JWT_ISSUER)
      .setAudience(this.config.JWT_AUDIENCE)
      .setIssuedAt()
      .setExpirationTime(JWT.EXPIRY.ACCESS)
      .sign(this.accessSecret);
  }

  /**
   * Create Refresh Token
   */
  async signRefreshToken(payload: RefreshTokenPayload): Promise<string> {
    return new SignJWT({
      sessionId: payload.sessionId,
      deviceId: payload.deviceId,
      userTokenVersion: payload.userTokenVersion,
      deviceTokenVersion: payload.deviceTokenVersion,
      type: payload.type,
    })
      .setProtectedHeader({ alg: ALGORITHM, typ: "JWT" })
      .setSubject(payload.sub)
      .setIssuer(this.config.JWT_ISSUER)
      .setAudience(this.config.JWT_AUDIENCE)
      .setIssuedAt()
      .setExpirationTime(JWT.EXPIRY.REFRESH)
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
        algorithms: [JWT.ALGORITHM],
        clockTolerance: JWT.CLOCK_TOLERANCE_SECONDS,
      });

      if (payload.type !== JWT.TOKEN_TYPE.ACCESS) {
        throw Errors.auth.tokenInvalid();
      }

      if (!payload.sub) throw Errors.auth.tokenInvalid();

      return {
        sub: payload.sub,
        sessionId: payload.sessionId as string,
        deviceId: payload.deviceId as string,
        userTokenVersion: payload.userTokenVersion as number,
        deviceTokenVersion: payload.deviceTokenVersion as number,
        organizationId: payload.organizationId as string,
        organizationRole: payload.organizationRole as string,
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
        userTokenVersion: payload.userTokenVersion as number,
        deviceTokenVersion: payload.deviceTokenVersion as number,
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

  async signEmailVerificationToken(userId: string): Promise<string> {
    return new SignJWT({
      type: "email_verification",
    })
      .setProtectedHeader({
        alg: ALGORITHM,
        typ: "JWT",
      })
      .setSubject(userId)
      .setIssuer(this.config.JWT_ISSUER)
      .setAudience(this.config.JWT_AUDIENCE)
      .setIssuedAt()
      .setExpirationTime(JWT.EXPIRY.EMAIL_VERIFICATION)
      .sign(this.accessSecret);
  }

  async verifyEmailVerificationToken(
    token: string,
  ): Promise<EmailVerificationPayload> {
    try {
      const { payload } = await jwtVerify(token, this.accessSecret, {
        issuer: this.config.JWT_ISSUER,
        audience: this.config.JWT_AUDIENCE,
        algorithms: [ALGORITHM],
      });

      if (payload.type !== "email_verification") {
        throw Errors.auth.tokenInvalid();
      }

      if (!payload.sub) {
        throw Errors.auth.tokenInvalid();
      }

      return {
        sub: payload.sub,
        type: "email_verification",
      };
    } catch (error) {
      this.handleJoseError(error);
    }
  }

  // mfa
  async signMfaChallengeToken(
    payload: Omit<MfaChallengePayload, "type">,
  ): Promise<string> {
    return new SignJWT({
      sessionId: payload.sessionId,
      deviceId: payload.deviceId,
      type: "mfa_challenge",
    })
      .setProtectedHeader({ alg: ALGORITHM, typ: "JWT" })
      .setSubject(payload.sub)
      .setIssuer(this.config.JWT_ISSUER)
      .setAudience(this.config.JWT_AUDIENCE)
      .setIssuedAt()
      .setExpirationTime(JWT.EXPIRY.MFA_CHALLENGE)
      .sign(this.accessSecret);
  }

  async verifyMfaChallengeToken(token: string): Promise<MfaChallengePayload> {
    try {
      const { payload } = await jwtVerify(token, this.accessSecret, {
        issuer: this.config.JWT_ISSUER,
        audience: this.config.JWT_AUDIENCE,
        algorithms: [ALGORITHM],
      });

      if (payload.type !== "mfa_challenge") {
        throw Errors.auth.tokenInvalid();
      }

      if (!payload.sub) {
        throw Errors.auth.tokenInvalid();
      }

      return {
        sub: payload.sub,
        sessionId: payload.sessionId as string,
        deviceId: payload.deviceId as string,
        type: "mfa_challenge",
      };
    } catch (error) {
      this.handleJoseError(error);
    }
  }
}
