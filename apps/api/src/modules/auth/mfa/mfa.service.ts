import * as OTPAuth from "otpauth";
import { LoggedService } from "../../../core/base/logger.service";

export const PENDING_MFA_TTL_MINUTES = 10;

export class MfaService extends LoggedService {
  /**
   * Generate a new TOTP secret.
   */
  generateSecret() {
    return new OTPAuth.Secret({ size: 20 }).base32;
  }

  /**
   * Build OTPAuth URL for QR generation.
   */
  createOtpAuthUrl(email: string, secretBase32: string): string {
    const totp = new OTPAuth.TOTP({
      issuer: "Syncr",
      label: email,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secretBase32),
    });

    return totp.toString();
  }

  /**
   * Begin MFA enrollment.
   *
   * Persistence is handled by CredentialService.
   */
  beginEnrollment(email: string) {
    const secret = this.generateSecret();

    return {
      secret,
      otpauthUrl: this.createOtpAuthUrl(email, secret),
      expiresAt: new Date(Date.now() + PENDING_MFA_TTL_MINUTES * 60 * 1000),
    };
  }

  /**
   * Verify a TOTP code.
   *
   * window:1 accepts previous/next 30-second window.
   */
  verifyCode(secretBase32: string, code: string): boolean {
    const totp = new OTPAuth.TOTP({
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secretBase32),
    });

    return (
      totp.validate({
        token: code,
        window: 1,
      }) !== null
    );
  }

  /**
   * Generate one-time recovery codes.
   */
  generateRecoveryCodes(count = 10): string[] {
    return Array.from({ length: count }, () =>
      crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase(),
    );
  }
}
