// src/modules/auth/password-reset/password-reset.service.ts
//
// Backed by the `password_reset_tokens` table already in your migration
// (status enum: PENDING | USED | EXPIRED | REVOKED). This service needs a
// PasswordResetRepo — I don't have your DeviceRepo/CredentialRepo
// implementations to copy the exact query style, so the repo calls below
// are named for what they do; implement them against your Drizzle table
// the same way credential.repo.ts implements CredentialService's calls.

import type { Logger } from "pino";
import type { AppConfig } from "../../../config";
import { BaseService } from "../../../core/base";
import type { RepoContext } from "../../../core/base/base.repo";
import { Errors } from "../../../errors";
import { PasswordResetRepo } from "./password-reset.repo"; // TODO: implement, mirrors credential.repo.ts

const RESET_TOKEN_TTL_MINUTES = 60;

export class PasswordResetService extends BaseService {
  private readonly repo: PasswordResetRepo;

  constructor(db: RepoContext, config: AppConfig, logger: Logger) {
    super(db, config, logger);
    this.repo = new PasswordResetRepo(db);
  }

  /**
   * Issues a new reset token. Invalidates any still-PENDING tokens for
   * this user first — only one active reset link should ever work at a
   * time, otherwise an old leaked email link stays exploitable forever.
   */
  async createToken(userId: string): Promise<{ rawToken: string }> {
    await this.repo.revokeAllPendingForUser(userId);

    const rawToken = this.generateToken();
    const tokenHash = await this.hashToken(rawToken);
    const expiresAt = new Date(
      Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000,
    );

    await this.repo.create({ userId, tokenHash, status: "PENDING", expiresAt });

    return { rawToken };
  }

  /**
   * Verifies + burns a reset token in one step (single use). Throws on
   * missing, expired, or already-used tokens — the controller maps these
   * to a generic "invalid or expired link" message; don't leak which.
   */
  async consumeToken(rawToken: string): Promise<{ userId: string }> {
    const tokenHash = await this.hashToken(rawToken);
    const record = await this.repo.findByTokenHash(tokenHash);

    if (!record || record.status !== "PENDING") {
      throw Errors.auth.resetTokenInvalid();
    }
    if (record.expiresAt < new Date()) {
      await this.repo.markExpired(record.id);
      throw Errors.auth.resetTokenExpired();
    }

    await this.repo.markUsed(record.id);
    return { userId: record.userId };
  }

  private generateToken(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  private async hashToken(token: string): Promise<string> {
    const buf = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(token),
    );
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}
