// src/db/schema/auth/login-history.ts

import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { loginFailureReasonEnum, loginMethodEnum } from "../../enums/auth";
import { devices } from "./devices";
import { users } from "./users";

export const loginHistory = pgTable(
  "login_history",
  {
    id: uuid("login_history_id").defaultRandom().primaryKey(),

    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    deviceId: uuid("device_id").references(() => devices.id, {
      onDelete: "set null",
    }),

    // Email / Phone used during login attempt
    loginIdentifier: text("login_identifier"),

    ipAddress: text("ip_address"),

    userAgent: text("user_agent"),

    loginMethod: loginMethodEnum("login_method").notNull(),

    success: boolean("success").notNull(),

    failureReason: loginFailureReasonEnum("failure_reason"),

    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("login_history_user_idx").on(table.userId, table.createdAt),

    index("login_history_device_idx").on(table.deviceId),

    index("login_history_identifier_idx").on(
      table.loginIdentifier,
      table.createdAt,
    ),

    index("login_history_ip_idx").on(table.ipAddress, table.createdAt),

    index("login_history_created_at_idx").on(table.createdAt),
  ],
);
