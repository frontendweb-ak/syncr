import {
  index,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { organizationMembers } from "../organization";
import { projects } from "./projects";

export const projectMembers = pgTable(
  "project_members",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    organizationMemberId: uuid("organization_member_id")
      .notNull()
      .references(() => organizationMembers.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    joinedAt: timestamp("joined_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    addedByUserId: uuid("added_by_user_id"),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }),
  },
  (table) => [
    primaryKey({
      columns: [table.projectId, table.organizationMemberId],
    }),

    index("project_members_project_idx").on(table.projectId),

    index("project_members_workspace_member_idx").on(
      table.organizationMemberId,
    ),
  ],
);
