import { userAuthProviders } from "@syncr/db";
import {
  and,
  eq,
  type InferInsertModel,
  type InferSelectModel,
} from "drizzle-orm";
import { BaseRepo } from "../../../core/base/base.repo";
import { Errors } from "../../../errors";

export type UserAuthProvider = InferSelectModel<typeof userAuthProviders>;
export type NewUserAuthProvider = InferInsertModel<typeof userAuthProviders>;

export class AuthProviderRepo extends BaseRepo {
  async create(data: NewUserAuthProvider): Promise<UserAuthProvider> {
    const rows = await this.db
      .insert(userAuthProviders)
      .values(data)
      .returning();

    return this.firstOrThrow(rows, Errors.auth.credentialsCreateFailed());
  }

  async findById(id: string) {
    const rows = await this.db
      .select()
      .from(userAuthProviders)
      .where(eq(userAuthProviders.id, id))
      .limit(1);

    return this.first(rows);
  }

  async findByUserId(userId: string) {
    return this.db
      .select()
      .from(userAuthProviders)
      .where(eq(userAuthProviders.userId, userId));
  }

  async findByProvider(
    provider: UserAuthProvider["provider"],
    providerId: string,
  ) {
    const rows = await this.db
      .select()
      .from(userAuthProviders)
      .where(
        and(
          eq(userAuthProviders.provider, provider),
          eq(userAuthProviders.providerId, providerId),
        ),
      )
      .limit(1);

    return this.first(rows);
  }

  async existsProvider(
    provider: UserAuthProvider["provider"],
    providerId: string,
  ): Promise<boolean> {
    const rows = await this.db
      .select({ id: userAuthProviders.id })
      .from(userAuthProviders)
      .where(
        and(
          eq(userAuthProviders.provider, provider),
          eq(userAuthProviders.providerId, providerId),
        ),
      )
      .limit(1);

    return rows.length > 0;
  }

  async linkProvider(data: NewUserAuthProvider) {
    return this.create(data);
  }

  async unlinkProvider(userId: string, provider: UserAuthProvider["provider"]) {
    await this.db
      .delete(userAuthProviders)
      .where(
        and(
          eq(userAuthProviders.userId, userId),
          eq(userAuthProviders.provider, provider),
        ),
      );
  }

  async updateProviderId(id: string, providerId: string) {
    await this.db
      .update(userAuthProviders)
      .set({
        providerId,
        updatedAt: new Date(),
      })
      .where(eq(userAuthProviders.id, id));
  }

  async deleteAllForUser(userId: string) {
    await this.db
      .delete(userAuthProviders)
      .where(eq(userAuthProviders.userId, userId));
  }
}
