import { users } from "@syncr/db";
import {
  and,
  eq,
  type InferInsertModel,
  type InferSelectModel,
  isNull,
  sql,
} from "drizzle-orm";
import { BaseRepo } from "../../core/base/base.repo";
import { Errors } from "../../errors";

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export class UserRepo extends BaseRepo {
  /**
   * Creates a new user record.
   *
   * Throws if the insert succeeds but no row is returned.
   */
  async create(data: NewUser) {
    const rows = await this.db.insert(users).values(data).returning();
    return this.firstOrThrow(rows, Errors.user.createFailed());
  }

  /**
   * Returns an active (non-soft-deleted) user by ID.
   *
   * Returns `null` if no matching user exists.
   */
  async findById(id: string) {
    const rows = await this.db
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)));

    return this.first(rows);
  }

  /**
   * Returns an active user by email.
   *
   * Performs a case-insensitive lookup.
   * Returns `null` if no matching user exists.
   */
  async findByEmail(email: string) {
    const rows = await this.db
      .select()
      .from(users)
      .where(
        and(
          sql`lower(${users.email}) = lower(${email})`,
          isNull(users.deletedAt),
        ),
      );

    return this.first(rows);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          sql`lower(${users.email}) = lower(${email})`,
          isNull(users.deletedAt),
        ),
      )
      .limit(1);

    return rows.length > 0;
  }

  async update(id: string, data: Partial<NewUser>) {
    const rows = await this.db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return this.firstOrThrow(rows, Errors.user.notFound());
  }

  async updateLastSeen(id: string): Promise<void> {
    const rows = await this.db
      .update(users)
      .set({
        lastSeenAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (!rows.length) throw Errors.user.notFound();
  }

  async updateLastLogin(id: string) {
    await this.db
      .update(users)
      .set({
        lastLoginAt: new Date(),
        lastSeenAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  async verifyEmail(id: string): Promise<void> {
    await this.db
      .update(users)
      .set({ status: "ACTIVE", emailVerified: true, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async updateStatus(
    id: string,
    status: User["status"],
    reason?: string,
  ): Promise<void> {
    await this.db
      .update(users)
      .set({
        status,
        statusReason: reason,
        statusChangedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  /**
   * Increments users.tokenVersion — immediately invalidates every access
   * token issued for this user on every device (Technical Design §3.5).
   * Called on: password change, password reset, logout-all, suspension.
   */
  async bumpTokenVersion(id: string): Promise<number> {
    const rows = await this.db
      .update(users)
      .set({
        tokenVersion: sql`${users.tokenVersion} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning({ tokenVersion: users.tokenVersion });
    const row = rows[0];
    if (!row) throw Errors.user.notFound();
    return row.tokenVersion;
  }

  async softDelete(id: string) {
    await this.db
      .update(users)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(users.id, id));
  }
}
