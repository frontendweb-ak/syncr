import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "../auth";
import { components } from "./components";
export const componentVersions = pgTable(
  "component_versions",
  {
    id: uuid("component_version_id").primaryKey().defaultRandom(),
    componentId: uuid("component_id")
      .notNull()
      .references(() => components.id, { onDelete: "cascade" }),
    version: text("version").notNull(), // semver, validated with Zod pre-insert
    changelog: text("changelog"),
    isBreaking: boolean("is_breaking").notNull().default(false),
    // S3 key: "orgs/<id>/components/button/2.4.1.tar.gz"
    storageKey: text("storage_key").notNull(),
    // SHA-256 of the tarball — used to reject no-op re-publishes.
    contentHash: text("content_hash").notNull(),
    publishedByUserId: uuid("published_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    // No updatedAt — versions are immutable. Publish a new one instead.
  },
  (t) => [
    uniqueIndex("component_versions_component_version_unique").on(
      t.componentId,
      t.version,
    ),
    index("component_versions_component_idx").on(t.componentId),
  ],
);
