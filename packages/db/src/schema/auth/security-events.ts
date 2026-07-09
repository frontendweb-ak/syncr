// src/db/schema/auth/security-events.ts

import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { securityEventTypeEnum } from "../../enums/auth";
import { devices } from "./devices";
import { users } from "./users";

export const securityEvents = pgTable(
  "security_events",
  {
    id: uuid("security_event_id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    deviceId: uuid("device_id").references(() => devices.id, {
      onDelete: "set null",
    }),
    eventType: securityEventTypeEnum("event_type").notNull(),
    ipAddress: text("ip_address"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("security_events_user_idx").on(table.userId, table.createdAt),
    index("security_events_device_idx").on(table.deviceId),
    index("security_events_type_idx").on(table.eventType),
    index("security_events_created_at_idx").on(table.createdAt),
  ],
);
