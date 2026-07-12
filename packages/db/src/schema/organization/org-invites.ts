import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { organizationInviteStatusEnum } from "../../enums/organization";
import { roles } from "../auth";
import { users } from "../auth/users";
import { timestamps } from "../common/timestamps";
import { organizations } from "./organizations";

export const organizationInvites = pgTable(
  "organization_invites",
  {
    id: uuid("organization_invite_id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    email: text("email").notNull(),
    invitedByUserId: uuid("invited_by_user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    acceptedByUserId: uuid("accepted_by_user_id").references(() => users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    roleId: uuid("role_id").references(() => roles.id, {
      onDelete: "set null",
    }),
    tokenHash: text("token_hash").notNull(),
    message: text("message"),
    status: organizationInviteStatusEnum("status").default("PENDING").notNull(),

    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),

    resentCount: integer("resent_count").default(0).notNull(),

    lastSentAt: timestamp("last_sent_at", { withTimezone: true }).defaultNow(),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    ...timestamps,
  },
  (table) => [
    index("organization_invites_org_idx").on(table.organizationId),
    index("organization_invites_email_idx").on(table.email),
    index("organization_invites_status_idx").on(table.status),
    uniqueIndex("organization_invites_token_unique").on(table.tokenHash),
  ],
);
