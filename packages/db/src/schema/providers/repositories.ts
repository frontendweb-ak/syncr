import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { repositoryStatusEnum, repositoryVisibilityEnum } from "../../enums";

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

    providerRepositoryId: text("provider_repository_id").notNull(),
    name: text("name").notNull(),
    fullName: text("full_name").notNull(),
    slug: text("slug").notNull(),
    defaultBranch: text("default_branch").default("main").notNull(),
    visibility: repositoryVisibilityEnum("visibility")
      .default("PRIVATE")
      .notNull(),

    status: repositoryStatusEnum("status").default("ACTIVE").notNull(),

    isFork: boolean("is_fork").default(false).notNull(),

    cloneUrl: text("clone_url"),

    sshUrl: text("ssh_url"),

    htmlUrl: text("html_url"),

    lastSyncedAt: timestamp("last_synced_at", {
      withTimezone: true,
    }),

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
  ],
);
