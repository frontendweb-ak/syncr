import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { syncProposalTypeEnum, syncStatusEnum } from "../../enums";

import { users } from "../auth";
import { timestamps } from "../common/timestamps";
import { components, componentVersions } from "../component";
import { repositories } from "../github";
import { organizations } from "../organization";

export const syncProposals = pgTable(
  "sync_proposals",
  {
    id: uuid("sync_proposal_id").defaultRandom().primaryKey(),

    // Denormalized for fast multi-tenant queries
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, {
        onDelete: "cascade",
      }),

    repositoryId: uuid("repository_id")
      .notNull()
      .references(() => repositories.id, {
        onDelete: "cascade",
      }),

    componentId: uuid("component_id")
      .notNull()
      .references(() => components.id, {
        onDelete: "cascade",
      }),

    fromComponentVersionId: uuid("from_component_version_id")
      .notNull()
      .references(() => componentVersions.id, {
        onDelete: "restrict",
      }),

    toComponentVersionId: uuid("to_component_version_id")
      .notNull()
      .references(() => componentVersions.id, {
        onDelete: "restrict",
      }),

    proposalType: syncProposalTypeEnum("proposal_type")
      .default("UPDATE")
      .notNull(),

    status: syncStatusEnum("status").default("PENDING").notNull(),

    isBreaking: boolean("is_breaking").default(false).notNull(),

    providerPullRequestId: text("provider_pull_request_id"),

    providerPullRequestNumber: integer("provider_pull_request_number"),

    providerPullRequestUrl: text("provider_pull_request_url"),

    branchName: text("branch_name"),

    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    approvedByUserId: uuid("approved_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),

    conflictMetadata: jsonb("conflict_metadata"),

    failureReason: text("failure_reason"),

    approvedAt: timestamp("approved_at", {
      withTimezone: true,
    }),

    mergedAt: timestamp("merged_at", {
      withTimezone: true,
    }),

    closedAt: timestamp("closed_at", {
      withTimezone: true,
    }),

    ...timestamps,
  },
  (table) => [
    index("sync_proposals_org_idx").on(table.organizationId),

    index("sync_proposals_repository_idx").on(table.repositoryId),

    index("sync_proposals_component_idx").on(table.componentId),

    index("sync_proposals_status_idx").on(table.status),

    uniqueIndex("sync_proposals_open_unique").on(
      table.repositoryId,
      table.componentId,
      table.status,
    ),
  ],
);
