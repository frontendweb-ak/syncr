// packages/database/schema/auth/passkeys.ts

import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";
export const passkeys = pgTable(
  "passkeys",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    credentialId: text("credential_id").notNull(),
    publicKey: text("public_key").notNull(),
    counter: integer("counter").notNull().default(0),
    transports: text("transports"),
    deviceType: text("device_type"),
    backedUp: boolean("backed_up").notNull().default(false),
    name: text("name"), // "MacBook Pro", "YubiKey", etc.
    lastUsedAt: timestamp("last_used_at", {
      withTimezone: true,
    }),
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
  },
  (table) => [
    uniqueIndex("passkeys_credential_uidx").on(table.credentialId),
    index("passkeys_user_idx").on(table.userId),
  ],
);
