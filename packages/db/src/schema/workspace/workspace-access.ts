import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { timestamps } from "../common/timestamps";

import { organizationMembers } from "../organization";
import { workspaces } from "./workspaces";

export const workspaceAccess = pgTable(
  "workspace_access",
  {
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    organizationMemberId: uuid("organization_member_id")
      .notNull()
      .references(() => organizationMembers.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    isDefault: boolean("is_default").default(false).notNull(),

    joinedAt: timestamp("joined_at", {
      withTimezone: true,
    }).defaultNow(),

    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`)
      .notNull(),

    ...timestamps,
  },
  (table) => [
    primaryKey({
      columns: [table.workspaceId, table.organizationMemberId],
    }),

    index("workspace_access_workspace_idx").on(table.workspaceId),

    index("workspace_access_member_idx").on(table.organizationMemberId),
  ],
);
