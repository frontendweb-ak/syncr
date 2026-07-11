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
import { componentFramework } from "../../enums";
import { organizations } from "../organization";
export const components = pgTable(
  "components",
  {
    id: uuid("component_id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(), // "button", "auth-form" — used in CLI
    name: text("name").notNull(),
    description: text("description"),
    framework: componentFramework("framework").notNull().default("UNIVERSAL"),
    isPublic: boolean("is_public").notNull().default(false),
    isDeprecated: boolean("is_deprecated").notNull().default(false),
    deprecatedAt: timestamp("deprecated_at", { withTimezone: true }),
    deprecationNote: text("deprecation_note"),
    // Denormalised pointer to the latest ComponentVersion row. No FK
    // constraint here on purpose — component_versions references this
    // table, so a hard FK the other way would be circular. Set/updated
    // atomically in application code whenever a new version publishes.
    latestVersionId: uuid("latest_version_id"),
    latestVersion: text("latest_version"), // e.g. "2.4.1", denormalised
    downloadCount: integer("download_count").notNull().default(0),
    repoUsageCount: integer("repo_usage_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("components_org_slug_unique").on(t.organizationId, t.slug),
    index("components_org_idx").on(t.organizationId),
    index("components_deprecated_idx").on(t.isDeprecated),
  ],
);
