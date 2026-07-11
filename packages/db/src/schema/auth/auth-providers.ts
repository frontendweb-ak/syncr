import { index, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { authProviderEnum } from "../../enums/auth";
import { timestamps } from "../common/timestamps";
import { users } from "./users";

export const userAuthProviders = pgTable(
  "user_auth_providers",
  {
    id: uuid("user_auth_provider_id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    provider: authProviderEnum("provider").notNull(),
    // Unique identifier returned by the provider
    // Examples:
    // Google -> google subject id
    // Apple -> apple subject id
    // Phone -> +919876543210
    // Email -> user@example.com
    // Supabase -> auth.users.id
    providerId: text("provider_id").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("user_auth_provider_unique").on(
      table.provider,
      table.providerId,
    ),
    index("user_auth_user_idx").on(table.userId),
    index("user_auth_provider_idx").on(table.provider),
  ],
);
