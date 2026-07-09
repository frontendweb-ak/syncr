// src/db/schema/auth/user-impersonations.ts

import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { impersonationStatusEnum } from "../../enums";
import { users } from "./users";

export const userImpersonations = pgTable(
  "user_impersonations",
  {
    id: uuid("user_impersonation_id").defaultRandom().primaryKey(),
    adminUserId: uuid("admin_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    targetUserId: uuid("target_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    reason: text("reason").notNull(),
    status: impersonationStatusEnum("status").default("ACTIVE").notNull(),
    ipAddress: text("ip_address"),
    startedAt: timestamp("started_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    endedAt: timestamp("ended_at", {
      mode: "date",
      withTimezone: true,
    }),
  },
  (table) => [
    index("user_impersonations_admin_idx").on(
      table.adminUserId,
      table.startedAt,
    ),

    index("user_impersonations_target_idx").on(
      table.targetUserId,
      table.startedAt,
    ),

    index("user_impersonations_active_idx").on(table.status, table.startedAt),
  ],
);
