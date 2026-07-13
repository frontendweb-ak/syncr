import type { Logger } from "pino";
import type { AppConfig } from "../../../config";
import type { RepoContext } from "../../../core/base/base.repo";
import { LoggedService } from "../../../core/base/logger.service";
import { Errors } from "../../../errors";
import type { JwtService } from "../../../lib";
import { SecurityEventRepo } from "../security";
import {
  type AuthCredential,
  CredentialRepo,
  type NewAuthCredential,
} from "./credential.repo";

export class CredentialService extends LoggedService {
  private readonly repo: CredentialRepo;
  private readonly securityEventRepo: SecurityEventRepo;

  constructor(
    db: RepoContext,
    jwt: JwtService,
    config: AppConfig,
    logger?: Logger,
  ) {
    super(db, jwt, config, logger);
    this.repo = new CredentialRepo(db);
    this.securityEventRepo = new SecurityEventRepo(db);
  }

  /**
   * Creates authentication credentials for a user.
   */
  async create(data: NewAuthCredential): Promise<AuthCredential> {
    const exists = await this.repo.existsCredential(data.userId);
    if (exists) throw Errors.auth.credentialsAlreadyExists();

    const credential = await this.repo.create(data);

    this.logger?.info(
      { userId: data.userId },
      "Authentication credentials created",
    );

    return credential;
  }

  /**
   * Returns credentials for a user.
   */
  async getCredential(userId: string): Promise<AuthCredential> {
    const credential = await this.repo.findByUserId(userId);
    if (!credential) {
      throw Errors.auth.credentialsNotFound();
    }
    return credential;
  }

  /**
   * Returns true if credentials exist.
   */
  async hasCredential(userId: string): Promise<boolean> {
    return this.repo.existsCredential(userId);
  }

  /**
   * Updates the password hash.
   */
  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.getCredential(userId);
    await this.repo.updatePasswordHash(userId, passwordHash);
    this.logger?.info({ userId }, "Password updated");
  }

  /**
   * Forces the user to reset their password.
   */
  async requirePasswordReset(userId: string): Promise<void> {
    await this.getCredential(userId);
    await this.repo.setMustResetPassword(userId, true);
  }

  /**
   * Clears the password reset requirement.
   */
  async clearPasswordReset(userId: string): Promise<void> {
    await this.getCredential(userId);
    await this.repo.setMustResetPassword(userId, false);
  }

  /**
   * Records a failed login attempt.
   */
  async recordFailedAttempt(
    userId: string,
    threshold: number,
    lockoutMinutes: number,
  ): Promise<AuthCredential> {
    return this.repo.recordFailedAttempt({
      userId,
      threshold,
      lockoutMinutes,
    });
  }

  /**
   * Clears failed login attempts.
   */
  async resetFailedAttempts(userId: string): Promise<void> {
    await this.repo.resetFailedAttempts(userId);
  }

  /**
   * Returns whether the account is locked.
   */
  async isLocked(userId: string): Promise<boolean> {
    return this.repo.isLocked(userId);
  }

  /**
   * Unlocks an account.
   */
  async unlock(userId: string): Promise<void> {
    await this.repo.unlock(userId);
    this.logger?.info({ userId }, "Account unlocked");
  }

  /**
   * Force locks an account.
   */
  async forceLock(userId: string, until: Date): Promise<void> {
    await this.repo.forceLock(userId, until);
    this.logger?.warn({ userId }, "Account locked");
  }

  /**
   * Enables MFA.
   */
  async enableMfa(
    userId: string,
    type: AuthCredential["mfaType"],
    encryptedSecret: string,
  ): Promise<void> {
    const credential = await this.getCredential(userId);
    if (credential.mfaEnabled) throw Errors.auth.mfaAlreadyEnabled();
    await this.repo.enableMfa(userId, type, encryptedSecret);
    this.logger?.info({ userId }, "MFA enabled");
  }

  /**
   * Disables MFA.
   */
  async disableMfa(userId: string): Promise<void> {
    const credential = await this.getCredential(userId);
    if (!credential.mfaEnabled) throw Errors.auth.mfaNotEnabled();
    await this.repo.disableMfa(userId);
    await this.securityEventRepo.create({
      userId,
      eventType: "MFA_DISABLED",
    });
    this.logger?.info({ userId }, "MFA disabled");
  }

  /**
   * Deletes credentials.
   */
  async deleteCredential(userId: string): Promise<void> {
    await this.repo.delete(userId);
    this.logger?.warn({ userId }, "Authentication credentials deleted");
  }

  /**
   * Saves a pending MFA enrollment secret.
   */
  async savePendingMfaSecret(input: {
    userId: string;
    secret: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.getCredential(input.userId);

    await this.repo.savePendingMfaSecret(
      input.userId,
      input.secret,
      input.expiresAt,
    );

    this.logger?.info({ userId: input.userId }, "Pending MFA secret saved");
  }

  /**
   * Returns the pending MFA enrollment secret.
   */
  async getPendingMfaSecret(userId: string): Promise<{
    secret: string;
    expiresAt: Date;
  } | null> {
    const credential = await this.getCredential(userId);

    if (
      !credential.mfaPendingSecretEncrypted ||
      !credential.mfaPendingExpiresAt
    ) {
      return null;
    }

    return {
      secret: credential.mfaPendingSecretEncrypted,
      expiresAt: credential.mfaPendingExpiresAt,
    };
  }

  /**
   * Clears any pending MFA enrollment.
   */
  async clearPendingMfaSecret(userId: string): Promise<void> {
    await this.getCredential(userId);

    await this.repo.clearPendingMfaSecret(userId);

    this.logger?.info({ userId }, "Pending MFA enrollment cleared");
  }
}
