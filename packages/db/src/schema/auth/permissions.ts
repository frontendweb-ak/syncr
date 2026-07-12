import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const permissions = pgTable(
  "permissions",
  {
    id: uuid("permission_id").defaultRandom().primaryKey(),
    name: text("name").notNull(), // syncr:repository:read
    resource: text("resource").notNull(),
    action: text("action").notNull(),
    description: text("description"),
    isSystem: boolean("is_system").default(true).notNull(),
    priority: integer("priority").default(100).notNull(),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("permissions_unique").on(
      sql`lower(${table.resource})`,
      sql`lower(${table.action})`,
    ),

    index("permissions_resource_idx").on(table.resource),

    index("permissions_system_idx").on(table.isSystem),
  ],
);
