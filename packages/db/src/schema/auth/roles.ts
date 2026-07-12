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
import { organizations } from "../organization";

export const roles = pgTable(
  "roles",
  {
    id: uuid("role_id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    isSystem: boolean("is_system").default(false).notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    priority: text("priority").default("100"),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("roles_slug_unique").on(
      table.organizationId,
      sql`lower(${table.slug})`,
    ),
    index("roles_org_idx").on(table.organizationId),
    index("roles_system_idx").on(table.isSystem),
  ],
);
