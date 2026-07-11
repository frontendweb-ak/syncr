import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import {
  repositoryRoleEnum,
  repositoryStatusEnum,
  repositoryVisibilityEnum,
} from "../../enums";

import { timestamps } from "../common/timestamps";
import { projects } from "../project";
import { providerConnections } from "../providers/provider-connections";

export const repositories = pgTable(
  "repositories",
  {
    id: uuid("repository_id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    providerConnectionId: uuid("provider_connection_id")
      .notNull()
      .references(() => providerConnections.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    // Stable ID from GitHub/GitLab/etc.
    providerRepositoryId: text("provider_repository_id").notNull(),
    name: text("name").notNull(),
    fullName: text("full_name").notNull(),
    slug: text("slug").notNull(),
    role: repositoryRoleEnum("role").notNull(),
    defaultBranch: text("default_branch").default("main").notNull(),
    visibility: repositoryVisibilityEnum("visibility")
      .default("PRIVATE")
      .notNull(),
    status: repositoryStatusEnum("status").default("ACTIVE").notNull(),
    isFork: boolean("is_fork").default(false).notNull(),
    cloneUrl: text("clone_url"),
    sshUrl: text("ssh_url"),
    htmlUrl: text("html_url"),
    // Git sync
    lastSyncedAt: timestamp("last_synced_at", {
      withTimezone: true,
    }),
    // Syncr scanner
    lastScannedAt: timestamp("last_scanned_at", {
      withTimezone: true,
    }),

    // Dashboard
    syncScore: integer("sync_score").default(100).notNull(),

    healthScore: text("health_score"),

    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`)
      .notNull(),

    archivedAt: timestamp("archived_at", {
      withTimezone: true,
    }),

    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
    }),

    ...timestamps,
  },
  (table) => [
    uniqueIndex("repositories_provider_unique").on(
      table.providerConnectionId,
      table.providerRepositoryId,
    ),

    uniqueIndex("repositories_project_slug_unique").on(
      table.projectId,
      sql`lower(${table.slug})`,
    ),
    index("repositories_project_idx").on(table.projectId),
    index("repositories_provider_idx").on(table.providerConnectionId),
    index("repositories_status_idx").on(table.status),
    index("repositories_role_idx").on(table.role),
    index("repositories_sync_score_idx").on(table.syncScore),
  ],
);