// src/modules/api-keys/api-key.repo.ts

import { apiKeys } from "@syncr/db";

import {
  and,
  eq,
  isNull,
  type InferInsertModel,
  type InferSelectModel,
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

  // Deliberately does NOT filter on expiresAt here. Expiry needs a
  // distinct error (Errors.apiKey.expired()) from "wrong/unknown key"
  // (Errors.apiKey.invalid()) — the service checks expiresAt itself
  // after fetching the row, so it can tell the two apart. If this
  // query also excluded expired rows, an expired key would come back
  // as "not found" and the caller could never distinguish it from a
  // bogus key. (Previous version also had a bug here: it compared
  // apiKeys.expiresAt to itself — `eq(col, col)` — which is always
  // true and filtered nothing.)
  async findActiveByPrefix(prefix: string) {
    const [apiKey] = await this.db
      .select()
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.prefix, prefix),
          eq(apiKeys.status, "ACTIVE"),
          isNull(apiKeys.revokedAt),
        ),
      )
      .limit(1);

    return apiKey ?? null;
  }

  async findByUserId(userId: string, status?: ApiKey["status"]) {
    return this.db
      .select()
      .from(apiKeys)
      .where(
        status
          ? and(eq(apiKeys.userId, userId), eq(apiKeys.status, status))
          : eq(apiKeys.userId, userId),
      )
      .orderBy(apiKeys.createdAt);
  }

  async findByOrganizationId(
    organizationId: string,
    status?: ApiKey["status"],
  ) {
    return this.db
      .select()
      .from(apiKeys)
      .where(
        status
          ? and(
              eq(apiKeys.organizationId, organizationId),
              eq(apiKeys.status, status),
            )
          : eq(apiKeys.organizationId, organizationId),
      )
      .orderBy(apiKeys.createdAt);
  }

  // NOT Partial<NewApiKey> — the previous version typed this as
  // Partial<NewApiKey> and read `input.ipAddress`, but the column is
  // `lastUsedIp`. NewApiKey has no `ipAddress` field at all, so that
  // value was always undefined and every "last used" write silently
  // cleared lastUsedIp instead of setting it.
  async updateUsage(input: { id: string; ipAddress?: string }) {
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
