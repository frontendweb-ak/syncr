import { passwordResetTokens } from "@syncr/db";
import type { CreatePasswordResetTokenInput } from "@syncr/types";
import {
  and,
  eq,
  type InferInsertModel,
  type InferSelectModel,
} from "drizzle-orm";
import { BaseRepo } from "../../../core/base/base.repo";

export type PasswordResetTokens = InferSelectModel<typeof passwordResetTokens>;
export type NewPasswordResetTokens = InferInsertModel<
  typeof passwordResetTokens
>;

export class PasswordResetRepo extends BaseRepo {
  async create(input: CreatePasswordResetTokenInput) {
    const [token] = await this.db
      .insert(passwordResetTokens)
      .values(input)
      .returning();

    return token;
  }

  async revokeAllPendingForUser(userId: string) {
    await this.db
      .update(passwordResetTokens)
      .set({
        status: "REVOKED",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(passwordResetTokens.userId, userId),
          eq(passwordResetTokens.status, "PENDING"),
        ),
      );
  }

  async findByTokenHash(tokenHash: string) {
    const [token] = await this.db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.tokenHash, tokenHash))
      .limit(1);

    return token ?? null;
  }

  async markUsed(id: string) {
    await this.db
      .update(passwordResetTokens)
      .set({
        status: "USED",
        usedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(passwordResetTokens.id, id));
  }

  async markExpired(id: string) {
    await this.db
      .update(passwordResetTokens)
      .set({
        status: "EXPIRED",
        updatedAt: new Date(),
      })
      .where(eq(passwordResetTokens.id, id));
  }
}
