import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { platformRole, userStatus } from "../../enums";
import { timestamps } from "../common";

export const users = pgTable(
  "users",
  {
    id: uuid("user_id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    status: userStatus("status").notNull().default("PENDING"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    platformRole: platformRole("platform_role").default("USER").notNull(),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    tokenVersion: integer("token_version").default(0).notNull(),
    statusReason: text("status_reason"),
    statusChangedAt: timestamp("status_changed_at", {
      mode: "date",
      withTimezone: true,
    }),
    lastSeenAt: timestamp("last_seen_at", { mode: "date", withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    deletedBy: uuid("deleted_by"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("users_email_unique").on(sql`lower(${table.email})`),
    index("users_status_idx").on(table.status),
  ],
);
