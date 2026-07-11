// src/modules/auth/mfa/mfa.service.ts
//
// TOTP enrollment + verification. Needs a TOTP library — this is written
// against `otpauth` (npm i otpauth), which works in both Node and
// Workers (no native crypto module dependency, unlike otplib's default
// build). Swap imports if you prefer a different one.
//
// ASSUMPTION: "pending" (unconfirmed) MFA secrets need somewhere to live
// between startMfaEnrollment and confirmMfaEnrollment. Below stores it
// encrypted in a short-lived KV/cache entry rather than the permanent
// auth_credentials.mfa_secret_encrypted column, so an abandoned enrollment
// never leaves a half-enabled MFA secret sitting in the credentials table.
// Your kv-store.ts (referenced in cloudflare.ts) looks like the right
// place for this — swap the `this.cache` calls below for whatever that
// module actually exposes.

import * as OTPAuth from "otpauth";
import { LoggedService } from "../../../core/base/logger.service";

const PENDING_MFA_TTL_SECONDS = 10 * 60; // enrollment window

export class MfaService extends LoggedService {
  /**
   * Starts enrollment: generates a new secret, stores it PENDING
   * (unconfirmed) for 10 minutes, returns everything the client needs to
   * render a QR code. Nothing is written to auth_credentials yet.
   */
  async beginEnrollment(userId: string, email: string) {
    const secret = new OTPAuth.Secret({ size: 20 });
    const totp = new OTPAuth.TOTP({
      issuer: "Syncr",
      label: email,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret,
    });

    const secretBase32 = secret.base32;

    // TODO: encrypt before storing, same as auth_credentials.mfa_secret_encrypted
    await this.cache.set(
      `mfa:pending:${userId}`,
      secretBase32,
      PENDING_MFA_TTL_SECONDS,
    );

    return {
      secret: secretBase32,
      otpauthUrl: totp.toString(),
    };
  }

  async getPendingSecret(userId: string): Promise<string | null> {
    return this.cache.get(`mfa:pending:${userId}`);
  }

  /**
   * Verifies a 6-digit code against a (decrypted) secret. `window: 1`
   * tolerates the code from the previous/next 30s step for clock drift.
   */
  async verifyCode(secretBase32: string, code: string): Promise<boolean> {
    const totp = new OTPAuth.TOTP({
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secretBase32),
    });
    const delta = totp.validate({ token: code, window: 1 });
    return delta !== null;
  }

  // Placeholder — wire to your actual KV/cache module (see note above).
  private cache = {
    async set(_key: string, _value: string, _ttlSeconds: number) {
      throw new Error(
        "MfaService.cache not wired — connect to your kv-store module",
      );
    },
    async get(_key: string): Promise<string | null> {
      throw new Error(
        "MfaService.cache not wired — connect to your kv-store module",
      );
    },
  };
}
