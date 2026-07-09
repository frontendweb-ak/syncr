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
    environmentVariableStatusEnum,
    environmentVariableTypeEnum,
} from "../../enums/project";

import { timestamps } from "../common/timestamps";
import { projectEnvironments } from "./project-environments";

export const environmentVariables = pgTable(
  "environment_variables",
  {
    id: uuid("environment_variable_id")
      .defaultRandom()
      .primaryKey(),

    environmentId: uuid("environment_id")
      .notNull()
      .references(() => projectEnvironments.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    key: text("key").notNull(),

    value: text("value").notNull(),

    type: environmentVariableTypeEnum("type")
      .default("STRING")
      .notNull(),

    description: text("description"),

    isSystem: boolean("is_system")
      .default(false)
      .notNull(),

    isReadonly: boolean("is_readonly")
      .default(false)
      .notNull(),

    status: environmentVariableStatusEnum("status")
      .default("ACTIVE")
      .notNull(),

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
    uniqueIndex("environment_variable_unique").on(
      table.environmentId,
      sql`lower(${table.key})`,
    ),

    index("environment_variable_environment_idx").on(
      table.environmentId,
    ),

    index("environment_variable_status_idx").on(
      table.status,
    ),
  ],
);