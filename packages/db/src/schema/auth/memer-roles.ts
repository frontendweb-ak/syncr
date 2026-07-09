import {
  index,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { organizationMembers } from "../organization";
import { roles } from "./roles";

export const memberRoles = pgTable(
  "member_roles",
  {
    organizationMemberId: uuid("organization_member_id")
      .notNull()
      .references(() => organizationMembers.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    assignedAt: timestamp("assigned_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    assignedByUserId: uuid("assigned_by_user_id"),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }),
  },
  (table) => [
    primaryKey({
      columns: [table.organizationMemberId, table.roleId],
    }),

    index("member_roles_member_idx").on(table.organizationMemberId),

    index("member_roles_role_idx").on(table.roleId),
  ],
);
