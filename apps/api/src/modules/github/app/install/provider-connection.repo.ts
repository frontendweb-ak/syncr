// src/modules/github/install/provider-connection.repo.ts
//
// Concrete implementation against the provider_connections table (plus
// the 3 columns from migration 0001_provider_connections_installation_fields.sql).
// Written against Drizzle directly — adjust `this.db` access to match
// your actual RepoContext/BaseRepo pattern if it wraps the client
// differently than shown (I don't have base.repo.ts, so this assumes
// db exposes the standard Drizzle query builder, following the same
// "this.repo does raw queries" shape your CredentialRepo etc. imply).

import { providerConnections } from "@syncr/db/schema"; // adjust import path to your schema module
import { and, eq, type InferSelectModel } from "drizzle-orm";
import type { RepoContext } from "../../../../core/base/base.repo";

export interface UpsertProviderConnectionInput {
  organizationId: string;
  provider: "GITHUB" | "GITLAB" | "BITBUCKET" | "AZURE_DEVOPS";
  accountId: string;
  accountName: string;
  installationId: string;
  status: "CONNECTED" | "DISCONNECTED" | "EXPIRED";
  permissionsSnapshot: Record<string, string>;
  suspendedAt: Date | null;
  uninstalledAt: Date | null;
}

export type ProviderConnection = InferSelectModel<typeof providerConnections>;
export type NewProviderConnection = InferSelectModel<
  typeof providerConnections
>;

export class ProviderConnectionRepo {
  constructor(private readonly db: RepoContext) {}

  /**
   * Upsert keyed on the existing unique index
   * (organization_id, provider, account_id) — safe to call from both
   * the initial install callback and a re-run "update" setup action.
   */
  async upsert(input: UpsertProviderConnectionInput) {
    const existing = await this.db.query.providerConnections.findFirst({
      where: and(
        eq(providerConnections.organizationId, input.organizationId),
        eq(providerConnections.provider, input.provider),
        eq(providerConnections.accountId, input.accountId),
      ),
    });

    if (existing) {
      const [updated] = await this.db
        .update(providerConnections)
        .set({
          accountName: input.accountName,
          installationId: input.installationId,
          status: input.status,
          permissionsSnapshot: input.permissionsSnapshot,
          suspendedAt: input.suspendedAt,
          uninstalledAt: input.uninstalledAt,
          updatedAt: new Date(),
        })
        .where(eq(providerConnections.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await this.db
      .insert(providerConnections)
      .values({
        organizationId: input.organizationId,
        provider: input.provider,
        accountId: input.accountId,
        accountName: input.accountName,
        installationId: input.installationId,
        status: input.status,
        permissionsSnapshot: input.permissionsSnapshot,
        suspendedAt: input.suspendedAt,
        uninstalledAt: input.uninstalledAt,
      })
      .returning();
    return created;
  }

  async findByInstallationId(installationId: string) {
    return this.db.query.providerConnections.findFirst({
      where: eq(providerConnections.installationId, installationId),
    });
  }

  async markUninstalled(installationId: string, at: Date) {
    return this.db
      .update(providerConnections)
      .set({ status: "DISCONNECTED", uninstalledAt: at, updatedAt: new Date() })
      .where(eq(providerConnections.installationId, installationId));
  }

  async markSuspended(installationId: string, at: Date | null) {
    return this.db
      .update(providerConnections)
      .set({ suspendedAt: at, updatedAt: new Date() })
      .where(eq(providerConnections.installationId, installationId));
  }

  async updatePermissions(
    installationId: string,
    permissions: Record<string, string>,
  ) {
    return this.db
      .update(providerConnections)
      .set({ permissionsSnapshot: permissions, updatedAt: new Date() })
      .where(eq(providerConnections.installationId, installationId));
  }

  /**
   * Used by the sync/detection engine before any GitHub API call —
   * "all sync operations pause for suspended installations" as a real
   * WHERE clause, per the earlier schema note.
   */
  async isUsable(installationId: string): Promise<boolean> {
    const conn = await this.findByInstallationId(installationId);
    if (!conn) return false;
    return (
      conn.status === "CONNECTED" && !conn.suspendedAt && !conn.uninstalledAt
    );
  }
}
