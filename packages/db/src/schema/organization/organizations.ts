import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { organizationPlanEnum, organizationStatusEnum } from "../../enums";

import { users } from "../auth/users";
import { timestamps } from "../common/timestamps";

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("organization_id").defaultRandom().primaryKey(),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    displayName: text("display_name"),
    description: text("description"),
    avatarUrl: text("avatar_url"),
    website: text("website"),
    email: text("email"),
    status: organizationStatusEnum("status").default("ACTIVE").notNull(),
    plan: organizationPlanEnum("plan").default("FREE").notNull(),
    isPersonal: boolean("is_personal").default(false).notNull(),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("organizations_slug_unique").on(sql`lower(${table.slug})`),
    uniqueIndex("organizations_one_personal_per_owner_uidx")
      .on(table.ownerUserId)
      .where(sql`${table.isPersonal} = true`),
    index("organizations_owner_idx").on(table.ownerUserId),
    index("organizations_status_idx").on(table.status),
    index("organizations_plan_idx").on(table.plan),
  ],
);
