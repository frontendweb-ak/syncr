import { authCredentials } from "@syncr/db";
import { eq, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { BaseRepo } from "../../../core/base/base.repo";
import { Errors } from "../../../errors";

export type AuthCredential = InferSelectModel<typeof authCredentials>;
export type NewAuthCredential = InferInsertModel<typeof authCredentials>;
export type FailedAttempt = {
  userId: string;
  threshold: number;
  lockoutMinutes: number;
};
export class CredentialRepo extends BaseRepo {
  async create(data: NewAuthCredential): Promise<AuthCredential> {
    const rows = await this.db.insert(authCredentials).values(data).returning();
    return this.firstOrThrow(rows, Errors.auth.passwordRequired());
  }

  async findByUserId(userId: string): Promise<AuthCredential | null> {
    const rows = await this.db
      .select()
      .from(authCredentials)
      .where(eq(authCredentials.userId, userId))
      .limit(1);

    return this.first(rows);
  }

  /**
   * Updates the password hash and bumps passwordChangedAt — used by both
   * initial-set (a Google/phone-only user adding a password) and
   * change/reset flows. Always also clears mustResetPassword and resets
   * the lockout counter, since a successful password write is the
   * correct point to clear both: a fresh password should never still be
   * gated by must-reset, and a user who just proved they can set a new
   * password has nothing left to "lock out" against.
   */
  async updatePasswordHash(
    userId: string,
    passwordHash: string,
  ): Promise<void> {
    await this.db
      .update(authCredentials)
      .set({
        passwordHash,
        passwordChangedAt: new Date(),
        mustResetPassword: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date(),
      })
      .where(eq(authCredentials.userId, userId));
  }

  async setMustResetPassword(userId: string, value: boolean): Promise<void> {
    await this.db
      .update(authCredentials)
      .set({ mustResetPassword: value, updatedAt: new Date() })
      .where(eq(authCredentials.userId, userId));
  }

  /**
   * Increments the failed-attempt counter and, if the threshold is
   * reached, sets lockedUntil. Returns the updated row so the caller
   * (AuthService) can decide what error/event to raise without a second
   * read. Technical Design §4.4.
   */
  async recordFailedAttempt({
    lockoutMinutes,
    threshold,
    userId,
  }: FailedAttempt): Promise<AuthCredential> {
    const current = await this.findByUserId(userId);
    if (!current) throw Errors.auth.passwordRequired();

    const nextAttempts = current.failedLoginAttempts + 1;
    const shouldLock = nextAttempts >= threshold;

    const rows = await this.db
      .update(authCredentials)
      .set({
        failedLoginAttempts: nextAttempts,
        lockedUntil: shouldLock
          ? new Date(Date.now() + lockoutMinutes * 60_000)
          : current.lockedUntil,
        updatedAt: new Date(),
      })
      .where(eq(authCredentials.userId, userId))
      .returning();

    return this.firstOrThrow(rows, Errors.auth.passwordRequired());
  }

  async resetFailedAttempts(userId: string): Promise<void> {
    await this.db
      .update(authCredentials)
      .set({ failedLoginAttempts: 0, lockedUntil: null, updatedAt: new Date() })
      .where(eq(authCredentials.userId, userId));
  }

  /** Admin-initiated lock, independent of the failed-attempt counter. */
  async forceLock(userId: string, until: Date): Promise<void> {
    await this.db
      .update(authCredentials)
      .set({ lockedUntil: until, updatedAt: new Date() })
      .where(eq(authCredentials.userId, userId));
  }

  async unlock(userId: string): Promise<void> {
    await this.resetFailedAttempts(userId);
  }

  async existsCredential(userId: string): Promise<boolean> {
    const row = await this.db
      .select({ id: authCredentials.id })
      .from(authCredentials)
      .where(eq(authCredentials.userId, userId))
      .limit(1);

    return row.length > 0;
  }

  async enableMfa(
    userId: string,
    type: AuthCredential["mfaType"],
    secret: string,
  ): Promise<void> {
    await this.db
      .update(authCredentials)
      .set({
        mfaEnabled: true,
        mfaType: type,
        mfaSecretEncrypted: secret,
        updatedAt: new Date(),
      })
      .where(eq(authCredentials.userId, userId));
  }

  async disableMfa(userId: string): Promise<void> {
    await this.db
      .update(authCredentials)
      .set({
        mfaEnabled: false,
        mfaType: null,
        mfaSecretEncrypted: null,
        updatedAt: new Date(),
      })
      .where(eq(authCredentials.userId, userId));
  }

  async isLocked(userId: string): Promise<boolean> {
    const credential = await this.findByUserId(userId);

    if (!credential) {
      throw Errors.auth.passwordRequired();
    }

    return !!(credential.lockedUntil && credential.lockedUntil > new Date());
  }

  async clearLock(userId: string): Promise<void> {
    await this.db
      .update(authCredentials)
      .set({
        failedLoginAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date(),
      })
      .where(eq(authCredentials.userId, userId));
  }

  async delete(userId: string): Promise<void> {
    await this.db
      .delete(authCredentials)
      .where(eq(authCredentials.userId, userId));
  }

  async savePendingMfaSecret(
    userId: string,
    secret: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.db
      .update(authCredentials)
      .set({
        mfaPendingSecretEncrypted: secret,
        mfaPendingExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(authCredentials.userId, userId));
  }

  async clearPendingMfaSecret(userId: string): Promise<void> {
    await this.db
      .update(authCredentials)
      .set({
        mfaPendingSecretEncrypted: null,
        mfaPendingExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(authCredentials.userId, userId));
  }
}
