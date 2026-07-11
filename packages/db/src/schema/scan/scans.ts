import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { scanStatus } from "../../enums";
import { repositories } from "../github";
export const scans = pgTable(
  "scans",
  {
    id: uuid("scan_id").primaryKey().defaultRandom(),
    repoId: uuid("repo_id")
      .notNull()
      .references(() => repositories.id, { onDelete: "cascade" }),
    status: scanStatus("status").notNull().default("PENDING"),
    criticalCount: integer("critical_count").notNull().default(0),
    highCount: integer("high_count").notNull().default(0),
    mediumCount: integer("medium_count").notNull().default(0),
    lowCount: integer("low_count").notNull().default(0),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("scans_repo_idx").on(t.repoId),
    index("scans_status_idx").on(t.status),
  ],
);
