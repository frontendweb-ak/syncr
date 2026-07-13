import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { organizationMembers } from "../organization";
import { permissions } from "./permissions";

export const memberResourcePermissions = pgTable(
  "member_resource_permissions",
  {
    organizationMemberId: uuid("organization_member_id")
      .notNull()
      .references(() => organizationMembers.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    resourceType: text("resource_type").notNull(),
    resourceId: uuid("resource_id").notNull(),
    allow: boolean("allow").default(true).notNull(),
    assignedByUserId: uuid("assigned_by_user_id"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`)
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [
        table.organizationMemberId,
        table.permissionId,
        table.resourceId,
      ],
    }),
    index("mrp_member_idx").on(table.organizationMemberId),
    index("mrp_resource_idx").on(table.resourceType, table.resourceId),
    index("mrp_permission_idx").on(table.permissionId),
  ],
);
