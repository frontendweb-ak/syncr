import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { providerConnectionStatusEnum, providerEnum } from "../../enums";
import { timestamps } from "../common";
import { organizations } from "../organization";
export const providerConnections = pgTable(
  "provider_connections",
  {
    id: uuid("provider_connection_id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    provider: providerEnum("provider").notNull(),
    accountId: text("account_id").notNull(), // Provider account/org ID
    accountName: text("account_name").notNull(),
    installationId: text("installation_id"), // GitHub App installation ID
    status: providerConnectionStatusEnum("status")
      .default("CONNECTED")
      .notNull(),
    accessTokenEncrypted: text("access_token_encrypted"),
    refreshTokenEncrypted: text("refresh_token_encrypted"),

    expiresAt: timestamp("expires_at", { withTimezone: true }),
    /**
     * Snapshot of granted scopes/permissions
     * at installation time.
     *
     * Example:
     *
     * {
     *   "contents": "read",
     *   "pull_requests": "write",
     *   "issues": "write"
     * }
     */
    permissionsSnapshot: jsonb("permissions_snapshot")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`)
      .notNull(),

    /**
     * Provider temporarily disabled access.
     *
     * Examples:
     * - GitHub suspended installation
     * - Slack workspace suspended app
     */
    suspendedAt: timestamp("suspended_at", {
      withTimezone: true,
    }),

    /**
     * Installation removed from provider.
     *
     * Examples:
     * - github_app.uninstalled
     * - app_uninstalled webhook
     */
    uninstalledAt: timestamp("uninstalled_at", {
      withTimezone: true,
    }),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("provider_connection_unique").on(
      table.organizationId,
      table.provider,
      table.accountId,
    ),

    index("provider_connection_org_idx").on(table.organizationId),
    index("provider_connection_provider_idx").on(table.provider),
    index("provider_connection_status_idx").on(table.status),
    index("provider_connection_expires_idx").on(table.expiresAt),
    index("provider_connection_suspended_idx").on(table.suspendedAt),
    index("provider_connection_uninstalled_idx").on(table.uninstalledAt),
  ],
);
