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

import { projectStatusEnum, projectVisibilityEnum } from "../../enums";
import { timestamps } from "../common/timestamps";
import { workspaces } from "../workspace";

export const projects = pgTable(
  "projects",
  {
    id: uuid("project_id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    displayName: text("display_name"),
    description: text("description"),
    iconUrl: text("icon_url"),
    color: text("color"),
    visibility: projectVisibilityEnum("visibility")
      .default("PRIVATE")
      .notNull(),
    status: projectStatusEnum("status").default("ACTIVE").notNull(),
    defaultBranch: text("default_branch").default("main").notNull(),
    archivedAt: timestamp("archived_at", {
      withTimezone: true,
    }),
    isTemplate: boolean("is_template").default(false).notNull(),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
    }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("projects_workspace_slug_unique").on(
      table.workspaceId,
      sql`lower(${table.slug})`,
    ),
    index("projects_workspace_idx").on(table.workspaceId),
    index("projects_status_idx").on(table.status),
    index("projects_visibility_idx").on(table.visibility),
  ],
);
