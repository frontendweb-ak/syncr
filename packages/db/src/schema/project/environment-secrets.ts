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

import { timestamps } from "../common/timestamps";
import { projectEnvironments } from "./project-environments";

export const environmentSecrets = pgTable(
  "environment_secrets",
  {
    id: uuid("environment_secret_id").defaultRandom().primaryKey(),

    environmentId: uuid("environment_id")
      .notNull()
      .references(() => projectEnvironments.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    key: text("key").notNull(),

    encryptedValue: text("encrypted_value").notNull(),

    description: text("description"),

    isSystem: boolean("is_system").default(false).notNull(),

    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`)
      .notNull(),

    rotatedAt: timestamp("rotated_at", {
      withTimezone: true,
    }),

    ...timestamps,
  },
  (table) => [
    uniqueIndex("environment_secret_unique").on(
      table.environmentId,
      sql`lower(${table.key})`,
    ),

    index("environment_secret_environment_idx").on(table.environmentId),
  ],
);
