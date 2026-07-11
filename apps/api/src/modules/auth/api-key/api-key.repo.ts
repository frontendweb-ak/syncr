import { apiKeys } from "@syncr/db";

import {
  and,
  eq,
  type InferInsertModel,
  type InferSelectModel,
  isNull,
  or,
} from "drizzle-orm";

import { BaseRepo } from "../../../core/base/base.repo";

export type ApiKey = InferSelectModel<typeof apiKeys>;
export type NewApiKey = InferInsertModel<typeof apiKeys>;

export class ApiKeyRepo extends BaseRepo {
  async create(input: NewApiKey) {
    const [apiKey] = await this.db.insert(apiKeys).values(input).returning();

    return apiKey;
  }

  async findById(id: string) {
    const [apiKey] = await this.db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.id, id))
      .limit(1);

    return apiKey ?? null;
  }

  async findByPrefix(prefix: string) {
    const [apiKey] = await this.db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.prefix, prefix))
      .limit(1);

    return apiKey ?? null;
  }

  async findActiveByPrefix(prefix: string) {
    const [apiKey] = await this.db
      .select()
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.prefix, prefix),
          eq(apiKeys.status, "ACTIVE"),
          isNull(apiKeys.revokedAt),
          or(
            isNull(apiKeys.expiresAt),
            eq(apiKeys.expiresAt, apiKeys.expiresAt),
          ),
        ),
      )
      .limit(1);

    return apiKey ?? null;
  }

  async findByUserId(userId: string) {
    return this.db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(apiKeys.createdAt);
  }

  async findByOrganizationId(organizationId: string) {
    return this.db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.organizationId, organizationId))
      .orderBy(apiKeys.createdAt);
  }

  async updateUsage(input: Partial<NewApiKey>) {
    await this.db
      .update(apiKeys)
      .set({
        lastUsedAt: new Date(),
        lastUsedIp: input.ipAddress,
        updatedAt: new Date(),
      })
      .where(eq(apiKeys.id, input.id));
  }

  async revoke(id: string, revokedBy: string, reason?: string) {
    await this.db
      .update(apiKeys)
      .set({
        status: "REVOKED",
        revokedAt: new Date(),
        revokedBy,
        revokeReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(apiKeys.id, id));
  }

  async activate(id: string) {
    await this.db
      .update(apiKeys)
      .set({
        status: "ACTIVE",
        revokedAt: null,
        revokedBy: null,
        revokeReason: null,
        updatedAt: new Date(),
      })
      .where(eq(apiKeys.id, id));
  }

  async delete(id: string) {
    await this.db.delete(apiKeys).where(eq(apiKeys.id, id));
  }
}
