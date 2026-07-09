import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { apiKeyStatusEnum, apiKeyTypeEnum } from "../../enums";
import { users } from "../auth/users";
import { organizations } from "../organization";

export const apiKeys = pgTable(
  "api_keys",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    prefix: text("prefix").notNull(),
    secretHash: text("secret_hash").notNull(),
    type: apiKeyTypeEnum("type").notNull().default("PERSONAL"),
    status: apiKeyStatusEnum("status").notNull().default("ACTIVE"),
    userId: text("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    organizationId: text("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }),
    lastUsedAt: timestamp("last_used_at", {
      withTimezone: true,
    }),
    lastUsedIp: text("last_used_ip"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    revokedAt: timestamp("revoked_at", {
      withTimezone: true,
    }),
  },
  (table) => [
    uniqueIndex("api_keys_prefix_uidx").on(table.prefix),
    index("api_keys_user_idx").on(table.userId),
    index("api_keys_org_idx").on(table.organizationId),
    index("api_keys_status_idx").on(table.status),
  ],
);
