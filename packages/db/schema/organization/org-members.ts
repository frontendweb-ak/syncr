import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { organizationMemberStatusEnum } from "../../enums";

import { users } from "../auth/users";
import { timestamps } from "../common/timestamps";
import { organizations } from "./organizations";

export const organizationMembers = pgTable(
  "organization_members",
  {
    id: uuid("organization_member_id").defaultRandom().primaryKey(),

    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    invitedByUserId: uuid("invited_by_user_id").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),

    status: organizationMemberStatusEnum("status").default("INVITED").notNull(),

    joinedAt: timestamp("joined_at", {
      withTimezone: true,
    }),

    suspendedAt: timestamp("suspended_at", {
      withTimezone: true,
    }),

    removedAt: timestamp("removed_at", {
      withTimezone: true,
    }),

    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`)
      .notNull(),

    ...timestamps,
  },
  (table) => [
    uniqueIndex("organization_member_unique").on(
      table.organizationId,
      table.userId,
    ),

    index("organization_member_org_idx").on(table.organizationId),

    index("organization_member_user_idx").on(table.userId),

    index("organization_member_status_idx").on(table.status),
  ],
);
