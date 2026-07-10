// src/db/schema/auth/devices.ts

import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { deviceStatusEnum, deviceTypeEnum } from "../../enums/auth";
import { timestamps } from "../common/timestamps";
import { users } from "./users";

export const devices = pgTable(
  "devices",
  {
    id: uuid("device_id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    deviceType: deviceTypeEnum("device_type").default("WEB").notNull(),

    platform: text("platform"), // android | ios | web
    osVersion: text("os_version"),
    deviceName: text("device_name"),
    appVersion: text("app_version"),

    // Push Notifications
    pushToken: text("push_token"),

    // Device Fingerprint
    fingerprint: text("fingerprint").notNull(),

    // Authentication
    refreshTokenHash: text("refresh_token_hash"),
    // Per-device session-invalidation counter. Every access token issued
    // for THIS device is signed with this value at issuance time (see
    // jwt.service.ts); authMiddleware compares the token's claim against
    // this column. Bumping it invalidates only this device's outstanding
    // access tokens — used when a single session is suspicious (e.g. an
    // impossible-travel login alert on one device) without forcing every
    // other device the user is logged in on to also re-authenticate. For
    // "log out everywhere," see users.tokenVersion instead. Also bumped
    // automatically on refresh-token rotation reuse detection (see
    // AUTH_TECHNICAL.md "Refresh token theft detection").
    tokenVersion: integer("token_version").default(0).notNull(),

    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    revokeReason: text("revoke_reason"),

    status: deviceStatusEnum("status").default("ACTIVE").notNull(),
    lastActiveAt: timestamp("last_active_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }),
    revokedAt: timestamp("revoked_at", { mode: "date", withTimezone: true }),
    lastRefreshAt: timestamp("last_refresh_at", {
      mode: "date",
      withTimezone: true,
    }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("devices_push_token_unique").on(table.pushToken),
    uniqueIndex("devices_refresh_token_unique").on(table.refreshTokenHash),
    index("devices_user_idx").on(table.userId),
    uniqueIndex("devices_user_fingerprint_unique").on(
      table.userId,
      table.fingerprint,
    ),
    index("devices_status_idx").on(table.status),
    index("devices_last_active_idx").on(table.lastActiveAt),
  ],
);
