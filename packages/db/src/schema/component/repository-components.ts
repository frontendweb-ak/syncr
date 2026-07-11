import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { repositories } from "../github";
import { components } from "./components";
export const repoComponents = pgTable(
  "repo_components",
  {
    id: uuid("repo_component_id").primaryKey().defaultRandom(),
    repoId: uuid("repo_id")
      .notNull()
      .references(() => repositories.id, { onDelete: "cascade" }),
    componentId: uuid("component_id")
      .notNull()
      .references(() => components.id, { onDelete: "cascade" }),
    usedVersion: text("used_version").notNull(),
    latestVersion: text("latest_version").notNull(), // denormalised from Component
    isOutOfSync: boolean("is_out_of_sync").notNull().default(false),
    filePath: text("file_path").notNull(), // "src/components/Button/Button.tsx"
    detectedBy: text("detected_by").notNull(), // "file-name" | "import-path" | "hash"
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("repo_components_repo_component_unique").on(
      t.repoId,
      t.componentId,
    ),
    // The dashboard's single most important query: all stale repos in an org.
    index("repo_components_out_of_sync_idx").on(t.isOutOfSync),
    index("repo_components_repo_idx").on(t.repoId),
    index("repo_components_component_idx").on(t.componentId),
  ],
);
