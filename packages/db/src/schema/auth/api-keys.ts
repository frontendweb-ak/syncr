import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { apiKeyStatusEnum, apiKeyTypeEnum } from "../../enums";
import { users } from "../auth/users";
import { timestamps } from "../common";
import { organizations } from "../organization";

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("api_key_id").defaultRandom().primaryKey(),

    name: text("name").notNull(),
    description: text("description"),

    prefix: text("prefix").notNull(),
    secretHash: text("secret_hash").notNull(),

    type: apiKeyTypeEnum("type").notNull().default("PERSONAL"),
    status: apiKeyStatusEnum("status").notNull().default("ACTIVE"),

    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),

    lastUsedIp: text("last_used_ip"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),

    createdBy: uuid("created_by"),

    revokedBy: uuid("revoked_by"),
    revokeReason: text("revoke_reason"),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),

    metadata: jsonb("metadata")
      .default(sql`'{}'::jsonb`)
      .notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("api_keys_prefix_uidx").on(table.prefix),
    index("api_keys_user_idx").on(table.userId),
    index("api_keys_org_idx").on(table.organizationId),
    index("api_keys_status_idx").on(table.status),
    index("api_keys_expires_idx").on(table.expiresAt),
  ],
);
