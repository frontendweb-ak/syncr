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

import {
  projectEnvironmentStatusEnum,
  projectEnvironmentTypeEnum,
} from "../../enums/project";

import { timestamps } from "../common/timestamps";
import { projects } from "./projects";

export const projectEnvironments = pgTable(
  "project_environments",
  {
    id: uuid("project_environment_id").defaultRandom().primaryKey(),

    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    name: text("name").notNull(),

    slug: text("slug").notNull(),

    type: projectEnvironmentTypeEnum("type").default("CUSTOM").notNull(),

    description: text("description"),

    color: text("color"),

    status: projectEnvironmentStatusEnum("status").default("ACTIVE").notNull(),

    isDefault: boolean("is_default").default(false).notNull(),

    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),

    archivedAt: timestamp("archived_at", {
      withTimezone: true,
    }),

    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
    }),

    ...timestamps,
  },
  (table) => [
    uniqueIndex("project_environment_slug_unique").on(
      table.projectId,
      sql`lower(${table.slug})`,
    ),

    index("project_environment_project_idx").on(table.projectId),

    index("project_environment_status_idx").on(table.status),

    index("project_environment_type_idx").on(table.type),
  ],
);
