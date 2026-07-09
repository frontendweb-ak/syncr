import { sql } from "drizzle-orm";
import { check, jsonb, pgTable, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { OrganizationSettings } from "@syncr/types";
import { timestamps } from "../common/timestamps";
import { organizations } from "./organizations";

export const organizationSettings = pgTable(
  "organization_settings",
  {
    id: uuid("organization_settings_id").defaultRandom().primaryKey(),

    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    settings: jsonb("settings")
      .$type<OrganizationSettings>()
      .notNull()
      .default(sql`'{}'::jsonb`),

    ...timestamps,
  },
  (table) => [
    uniqueIndex("organization_settings_org_unique").on(table.organizationId),

    check(
      "organization_settings_object_check",
      sql`jsonb_typeof(${table.settings}) = 'object'`,
    ),
  ],
);
