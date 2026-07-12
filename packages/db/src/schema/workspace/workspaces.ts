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

import { workspaceStatusEnum } from "../../enums";
import { timestamps } from "../common/timestamps";
import { organizations } from "../organization";

export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid("workspace_id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    displayName: text("display_name"),
    description: text("description"),
    iconUrl: text("icon_url"),
    color: text("color"),
    status: workspaceStatusEnum("status").default("ACTIVE").notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("workspace_slug_unique").on(
      table.organizationId,
      sql`lower(${table.slug})`,
    ),
    uniqueIndex("workspace_one_default_per_org_uidx")
      .on(table.organizationId)
      .where(sql`${table.isDefault} = true`),
    index("workspace_org_idx").on(table.organizationId),
    index("workspace_status_idx").on(table.status),
  ],
);
