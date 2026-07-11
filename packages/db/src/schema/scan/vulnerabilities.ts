import {
  index,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { vulnerabilityStatus } from "../../enums";
import { repositories } from "../github";
import { scans } from "./scans";
export const vulnerabilities = pgTable(
  "vulnerabilities",
  {
    id: uuid("vulnerability_id").primaryKey().defaultRandom(),
    scanId: uuid("scan_id")
      .notNull()
      .references(() => scans.id, { onDelete: "cascade" }),
    // Denormalised so the security dashboard can query by repo without
    // joining through scans.
    repoId: uuid("repo_id")
      .notNull()
      .references(() => repositories.id, { onDelete: "cascade" }),
    cveId: text("cve_id").notNull(), // "CVE-2024-1234"
    osvId: text("osv_id"),
    packageEcosystem: text("package_ecosystem").notNull().default("npm"),
    packageName: text("package_name").notNull(),
    cvssScore: real("cvss_score"),
    status: vulnerabilityStatus("status").notNull().default("OPEN"),
    referenceUrls: text("reference_urls").array(),
    dismissedReason: text("dismissed_reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("vulnerabilities_repo_cve_unique").on(t.repoId, t.cveId),
    index("vulnerabilities_repo_idx").on(t.repoId),
    index("vulnerabilities_status_idx").on(t.status),
    index("vulnerabilities_cvss_idx").on(t.cvssScore),
  ],
);
