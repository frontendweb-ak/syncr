// packages/database/src/schema/syncr.ts
//
// Syncr-specific tables missing from the current migration.
// Adjust the import path below to wherever `organizations`, `users`,
// and `providerConnections` are actually defined in your schema.
//
// Everything your migration already has (users, organizations,
// organization_members, organization_invites, roles, permissions,
// role_permissions, member_roles, member_resource_permissions,
// provider_connections, projects, workspaces) is NOT redefined here.
// See the notes at the bottom for why each of those is already covered.

import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  integer,
  real,
  jsonb,
  timestamp,
  bigserial,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { organizations, users, providerConnections } from "./schema"; // <-- fix path

// ─────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────

export const componentFramework = pgEnum("component_framework", [
  "REACT",
  "VUE",
  "SVELTE",
  "ANGULAR",
  "SOLID",
  "UNIVERSAL",
]);

export const repoRole = pgEnum("repo_role", ["SOURCE", "CONSUMER"]);

export const syncStatus = pgEnum("sync_status", [
  "PENDING",
  "PR_OPENED",
  "APPROVED",
  "REJECTED",
  "CONFLICT",
  "MERGED",
]);

export const syncEventType = pgEnum("sync_event_type", [
  "PROPOSED",
  "PR_OPENED",
  "PR_MERGED",
  "PR_CLOSED",
  "APPROVED",
  "REJECTED",
  "CONFLICT",
  "ROLLBACK",
]);

export const scanStatus = pgEnum("scan_status", [
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "FAILED",
]);

export const vulnerabilityStatus = pgEnum("vulnerability_status", [
  "OPEN",
  "PATCHED",
  "DISMISSED",
  "FALSE_POSITIVE",
]);

export const subscriptionStatus = pgEnum("subscription_status", [
  "ACTIVE",
  "PAST_DUE",
  "CANCELED",
  "UNPAID",
  "TRIALING",
  "PAUSED",
]);

export const webhookDeliveryStatus = pgEnum("webhook_delivery_status", [
  "PENDING",
  "SUCCESS",
  "FAILED",
]);

// NOTE: your BRD models AuditLog.action as an exhaustive enum on purpose
// ("prevents arbitrary string actions that are hard to query"). Start
// with the actions your MVP routes actually perform and extend as you
// add routes — don't try to pre-enumerate everything on day one.
export const auditAction = pgEnum("audit_action", [
  "ORG_UPDATED",
  "ORG_DELETED",
  "MEMBER_INVITED",
  "MEMBER_REMOVED",
  "MEMBER_ROLE_UPDATED",
  "REPO_CONNECTED",
  "REPO_DISCONNECTED",
  "COMPONENT_PUBLISHED",
  "COMPONENT_DEPRECATED",
  "COMPONENT_DELETED",
  "SYNC_APPROVED",
  "SYNC_REJECTED",
  "SYNC_BULK_APPROVED",
  "VULNERABILITY_DISMISSED",
  "VULNERABILITY_PATCHED",
  "TOKEN_CREATED",
  "TOKEN_REVOKED",
  "WEBHOOK_UPDATED",
]);

// ─────────────────────────────────────────────────────────────
// 1. FeatureFlag — per-org overrides (beta access, killswitches)
// ─────────────────────────────────────────────────────────────

export const featureFlags = pgTable(
  "feature_flags",
  {
    featureFlagId: uuid("feature_flag_id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.organizationId, { onDelete: "cascade" }),
    flag: text("flag").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    // Required — prevents mystery flags with no accountability.
    reason: text("reason").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    orgFlagUnique: uniqueIndex("feature_flags_org_flag_unique").on(t.organizationId, t.flag),
    orgIdx: index("feature_flags_org_idx").on(t.organizationId),
  }),
);

// ─────────────────────────────────────────────────────────────
// 2. GithubWebhookEvent — raw webhook storage for replay
// ─────────────────────────────────────────────────────────────

export const githubWebhookEvents = pgTable(
  "github_webhook_events",
  {
    githubWebhookEventId: uuid("github_webhook_event_id").primaryKey().defaultRandom(),
    providerConnectionId: uuid("provider_connection_id").references(
      () => providerConnections.providerConnectionId,
      { onDelete: "set null" },
    ),
    // X-GitHub-Delivery header. Prevents double-processing GitHub retries.
    deliveryId: text("delivery_id").notNull(),
    // X-GitHub-Event header: "push" | "installation" | "pull_request" etc.
    event: text("event").notNull(),
    payload: jsonb("payload").notNull(),
    processed: boolean("processed").notNull().default(false),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    deliveryUnique: uniqueIndex("github_webhook_events_delivery_unique").on(t.deliveryId),
    processedIdx: index("github_webhook_events_processed_idx").on(t.processed),
  }),
);

// ─────────────────────────────────────────────────────────────
// 3. Repo — a GitHub repo connected to Syncr (SOURCE or CONSUMER)
// ─────────────────────────────────────────────────────────────

export const repos = pgTable(
  "repos",
  {
    repoId: uuid("repo_id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.organizationId, { onDelete: "cascade" }),
    providerConnectionId: uuid("provider_connection_id")
      .notNull()
      .references(() => providerConnections.providerConnectionId, { onDelete: "cascade" }),
    // GitHub's integer repo ID — stable across renames/transfers. Always
    // use this for GitHub API calls, never fullName.
    githubRepoId: integer("github_repo_id").notNull(),
    fullName: text("full_name").notNull(), // "acme-studio/design-system"
    role: repoRole("role").notNull(),
    // Optional compliance context: "healthcare" | "fintech" | "government"
    industry: text("industry"),
    // A–F, computed by the scanner. Denormalised for fast dashboard reads.
    healthScore: text("health_score"),
    // 0–100, % of components up to date. Denormalised.
    syncScore: integer("sync_score").default(100),
    lastScannedAt: timestamp("last_scanned_at", { withTimezone: true }),
    lastPushedAt: timestamp("last_pushed_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    githubRepoUnique: uniqueIndex("repos_github_repo_id_unique").on(t.githubRepoId),
    orgIdx: index("repos_org_idx").on(t.organizationId),
    roleIdx: index("repos_role_idx").on(t.role),
    syncScoreIdx: index("repos_sync_score_idx").on(t.syncScore),
  }),
);

// ─────────────────────────────────────────────────────────────
// 4. Component — the registry entry (metadata only, code lives
//    in ComponentVersion — think npm package vs. npm version)
// ─────────────────────────────────────────────────────────────

export const components = pgTable(
  "components",
  {
    componentId: uuid("component_id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.organizationId, { onDelete: "cascade" }),
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
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => ({
    orgSlugUnique: uniqueIndex("components_org_slug_unique").on(t.organizationId, t.slug),
    orgIdx: index("components_org_idx").on(t.organizationId),
    deprecatedIdx: index("components_deprecated_idx").on(t.isDeprecated),
  }),
);

// ─────────────────────────────────────────────────────────────
// 5. ComponentVersion — immutable published version
// ─────────────────────────────────────────────────────────────

export const componentVersions = pgTable(
  "component_versions",
  {
    componentVersionId: uuid("component_version_id").primaryKey().defaultRandom(),
    componentId: uuid("component_id")
      .notNull()
      .references(() => components.componentId, { onDelete: "cascade" }),
    version: text("version").notNull(), // semver, validated with Zod pre-insert
    changelog: text("changelog"),
    isBreaking: boolean("is_breaking").notNull().default(false),
    // S3 key: "orgs/<id>/components/button/2.4.1.tar.gz"
    storageKey: text("storage_key").notNull(),
    // SHA-256 of the tarball — used to reject no-op re-publishes.
    contentHash: text("content_hash").notNull(),
    publishedByUserId: uuid("published_by_user_id").references(() => users.userId, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    // No updatedAt — versions are immutable. Publish a new one instead.
  },
  (t) => ({
    componentVersionUnique: uniqueIndex("component_versions_component_version_unique").on(
      t.componentId,
      t.version,
    ),
    componentIdx: index("component_versions_component_idx").on(t.componentId),
  }),
);

// ─────────────────────────────────────────────────────────────
// 6. ComponentTag — freeform tags for registry discovery/filtering
//    (named but not detailed in the BRD's domain map — reasonable
//    minimal design below; adjust to your marketplace UX)
// ─────────────────────────────────────────────────────────────

export const componentTags = pgTable(
  "component_tags",
  {
    componentTagId: uuid("component_tag_id").primaryKey().defaultRandom(),
    componentId: uuid("component_id")
      .notNull()
      .references(() => components.componentId, { onDelete: "cascade" }),
    tag: text("tag").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    componentTagUnique: uniqueIndex("component_tags_unique").on(t.componentId, t.tag),
    tagIdx: index("component_tags_tag_idx").on(t.tag),
  }),
);

// ─────────────────────────────────────────────────────────────
// 7. RepoComponent — THE CORE TABLE. Which version of each
//    component is installed in each repo. Drift detection lives
//    here: isOutOfSync = usedVersion !== latestVersion.
// ─────────────────────────────────────────────────────────────

export const repoComponents = pgTable(
  "repo_components",
  {
    repoComponentId: uuid("repo_component_id").primaryKey().defaultRandom(),
    repoId: uuid("repo_id")
      .notNull()
      .references(() => repos.repoId, { onDelete: "cascade" }),
    componentId: uuid("component_id")
      .notNull()
      .references(() => components.componentId, { onDelete: "cascade" }),
    usedVersion: text("used_version").notNull(),
    latestVersion: text("latest_version").notNull(), // denormalised from Component
    isOutOfSync: boolean("is_out_of_sync").notNull().default(false),
    filePath: text("file_path").notNull(), // "src/components/Button/Button.tsx"
    detectedBy: text("detected_by").notNull(), // "file-name" | "import-path" | "hash"
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    repoComponentUnique: uniqueIndex("repo_components_repo_component_unique").on(
      t.repoId,
      t.componentId,
    ),
    // The dashboard's single most important query: all stale repos in an org.
    outOfSyncIdx: index("repo_components_out_of_sync_idx").on(t.isOutOfSync),
    repoIdx: index("repo_components_repo_idx").on(t.repoId),
    componentIdx: index("repo_components_component_idx").on(t.componentId),
  }),
);

// ─────────────────────────────────────────────────────────────
// 8. SyncProposal — one proposed update, PR-to-merge workflow
// ─────────────────────────────────────────────────────────────

export const syncProposals = pgTable(
  "sync_proposals",
  {
    syncProposalId: uuid("sync_proposal_id").primaryKey().defaultRandom(),
    // Denormalised org scope — every repository method must filter by
    // orgId per your "no cross-tenant access" rule, even via a repo join.
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.organizationId, { onDelete: "cascade" }),
    repoId: uuid("repo_id")
      .notNull()
      .references(() => repos.repoId, { onDelete: "cascade" }),
    componentId: uuid("component_id")
      .notNull()
      .references(() => components.componentId, { onDelete: "cascade" }),
    fromVersion: text("from_version").notNull(),
    toVersion: text("to_version").notNull(),
    isBreaking: boolean("is_breaking").notNull().default(false),
    status: syncStatus("status").notNull().default("PENDING"),
    githubPrUrl: text("github_pr_url"),
    githubPrNumber: integer("github_pr_number"),
    githubBranch: text("github_branch"),
    approvedByUserId: uuid("approved_by_user_id").references(() => users.userId, {
      onDelete: "set null",
    }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    conflictDetail: text("conflict_detail"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    orgIdx: index("sync_proposals_org_idx").on(t.organizationId),
    repoIdx: index("sync_proposals_repo_idx").on(t.repoId),
    statusIdx: index("sync_proposals_status_idx").on(t.status),
  }),
);

// ─────────────────────────────────────────────────────────────
// 9. SyncEvent — append-only audit trail per SyncProposal
// ─────────────────────────────────────────────────────────────

export const syncEvents = pgTable(
  "sync_events",
  {
    syncEventId: uuid("sync_event_id").primaryKey().defaultRandom(),
    syncProposalId: uuid("sync_proposal_id")
      .notNull()
      .references(() => syncProposals.syncProposalId, { onDelete: "cascade" }),
    event: syncEventType("event").notNull(),
    actorId: uuid("actor_id").references(() => users.userId, { onDelete: "set null" }),
    actorType: text("actor_type").notNull(), // "user" | "system" | "github"
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    // No updatedAt — events are facts, they never change.
  },
  (t) => ({
    proposalIdx: index("sync_events_proposal_idx").on(t.syncProposalId),
    createdAtIdx: index("sync_events_created_at_idx").on(t.createdAt),
  }),
);

// ─────────────────────────────────────────────────────────────
// 10. Scan — one CVE scan run against one repo
// ─────────────────────────────────────────────────────────────

export const scans = pgTable(
  "scans",
  {
    scanId: uuid("scan_id").primaryKey().defaultRandom(),
    repoId: uuid("repo_id")
      .notNull()
      .references(() => repos.repoId, { onDelete: "cascade" }),
    status: scanStatus("status").notNull().default("PENDING"),
    criticalCount: integer("critical_count").notNull().default(0),
    highCount: integer("high_count").notNull().default(0),
    mediumCount: integer("medium_count").notNull().default(0),
    lowCount: integer("low_count").notNull().default(0),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    repoIdx: index("scans_repo_idx").on(t.repoId),
    statusIdx: index("scans_status_idx").on(t.status),
  }),
);

// ─────────────────────────────────────────────────────────────
// 11. Vulnerability — one CVE found in one repo
// ─────────────────────────────────────────────────────────────

export const vulnerabilities = pgTable(
  "vulnerabilities",
  {
    vulnerabilityId: uuid("vulnerability_id").primaryKey().defaultRandom(),
    scanId: uuid("scan_id")
      .notNull()
      .references(() => scans.scanId, { onDelete: "cascade" }),
    // Denormalised so the security dashboard can query by repo without
    // joining through scans.
    repoId: uuid("repo_id")
      .notNull()
      .references(() => repos.repoId, { onDelete: "cascade" }),
    cveId: text("cve_id").notNull(), // "CVE-2024-1234"
    osvId: text("osv_id"),
    packageEcosystem: text("package_ecosystem").notNull().default("npm"),
    packageName: text("package_name").notNull(),
    cvssScore: real("cvss_score"),
    status: vulnerabilityStatus("status").notNull().default("OPEN"),
    referenceUrls: text("reference_urls").array(),
    dismissedReason: text("dismissed_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    repoCveUnique: uniqueIndex("vulnerabilities_repo_cve_unique").on(t.repoId, t.cveId),
    repoIdx: index("vulnerabilities_repo_idx").on(t.repoId),
    statusIdx: index("vulnerabilities_status_idx").on(t.status),
    cvssIdx: index("vulnerabilities_cvss_idx").on(t.cvssScore),
  }),
);

// ─────────────────────────────────────────────────────────────
// 12. Subscription — Stripe state per org, mirrors organizations.plan
// ─────────────────────────────────────────────────────────────

export const subscriptions = pgTable(
  "subscriptions",
  {
    subscriptionId: uuid("subscription_id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.organizationId, { onDelete: "cascade" }),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    status: subscriptionStatus("status").notNull().default("TRIALING"),
    trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    aiCreditsIncluded: integer("ai_credits_included").notNull().default(0),
    aiCreditsUsed: integer("ai_credits_used").notNull().default(0),
    aiCreditsResetAt: timestamp("ai_credits_reset_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    orgUnique: uniqueIndex("subscriptions_org_unique").on(t.organizationId),
    stripeCustomerUnique: uniqueIndex("subscriptions_stripe_customer_unique").on(
      t.stripeCustomerId,
    ),
    stripeSubUnique: uniqueIndex("subscriptions_stripe_sub_unique").on(t.stripeSubscriptionId),
  }),
);

// ─────────────────────────────────────────────────────────────
// 13. ApiToken — CLI authentication (long-lived, scoped)
// ─────────────────────────────────────────────────────────────

export const apiTokens = pgTable(
  "api_tokens",
  {
    apiTokenId: uuid("api_token_id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.organizationId, { onDelete: "cascade" }),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    name: text("name"),
    tokenHash: text("token_hash").notNull(), // bcrypt hash — raw shown once
    tokenPrefix: text("token_prefix").notNull(), // "sk_syncrA" — for UI display
    scopes: text("scopes").array().notNull().default([]),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    tokenHashUnique: uniqueIndex("api_tokens_hash_unique").on(t.tokenHash),
    orgIdx: index("api_tokens_org_idx").on(t.organizationId),
  }),
);

// ─────────────────────────────────────────────────────────────
// 14. AuditLog — immutable, BigInt PK for strict insertion order.
//     Your SOC2 evidence. Never updated, never deleted.
// ─────────────────────────────────────────────────────────────

export const auditLogs = pgTable(
  "audit_logs",
  {
    // bigserial, not uuid — UUIDs can't be ordered by insertion, and
    // the audit trail must guarantee event 10042 happened before 10043.
    auditLogId: bigserial("audit_log_id", { mode: "bigint" }).primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.organizationId, { onDelete: "cascade" }),
    actorUserId: uuid("actor_user_id").references(() => users.userId, { onDelete: "set null" }),
    action: auditAction("action").notNull(),
    resourceType: text("resource_type").notNull(),
    resourceId: text("resource_id").notNull(),
    // Human-readable name at time of action — survives later renames.
    resourceName: text("resource_name"),
    before: jsonb("before"),
    after: jsonb("after"),
    ipAddress: text("ip_address"),
    // Correlates with Lambda logs, API Gateway access logs, Sentry events.
    requestId: text("request_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    // The most common query: "all actions for this org, newest first."
    orgCreatedIdx: index("audit_logs_org_created_idx").on(t.organizationId, t.createdAt),
    resourceIdx: index("audit_logs_resource_idx").on(t.resourceType, t.resourceId),
  }),
);

// ─────────────────────────────────────────────────────────────
// 15/16. WebhookEndpoint + WebhookDelivery — outbound webhooks
//     to customer systems (Slack, custom integrations, etc.)
// ─────────────────────────────────────────────────────────────

export const webhookEndpoints = pgTable(
  "webhook_endpoints",
  {
    webhookEndpointId: uuid("webhook_endpoint_id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.organizationId, { onDelete: "cascade" }),
    url: text("url").notNull(),
    secretHash: text("secret_hash").notNull(), // used for HMAC signing
    events: text("events").array().notNull().default([]), // subscribed event types
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    orgIdx: index("webhook_endpoints_org_idx").on(t.organizationId),
  }),
);

export const webhookDeliveries = pgTable(
  "webhook_deliveries",
  {
    webhookDeliveryId: uuid("webhook_delivery_id").primaryKey().defaultRandom(),
    webhookEndpointId: uuid("webhook_endpoint_id")
      .notNull()
      .references(() => webhookEndpoints.webhookEndpointId, { onDelete: "cascade" }),
    event: text("event").notNull(),
    payload: jsonb("payload").notNull(),
    status: webhookDeliveryStatus("status").notNull().default("PENDING"),
    responseStatusCode: integer("response_status_code"),
    attemptCount: integer("attempt_count").notNull().default(0),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    endpointIdx: index("webhook_deliveries_endpoint_idx").on(t.webhookEndpointId),
    statusIdx: index("webhook_deliveries_status_idx").on(t.status),
  }),
);

/*
─────────────────────────────────────────────────────────────
NOT reproduced here — already covered by your existing migration:
─────────────────────────────────────────────────────────────

  Syncr model          → Your existing table(s)
  User                 → users
  Session               → devices + login_history (your version is
                          MORE capable than the BRD's Session model —
                          it tracks per-device refresh tokens, fingerprint,
                          push tokens. Keep it, don't add a Session table.)
  Org                  → organizations
  OrgMember             → organization_members
  Invitation            → organization_invites
  Role/Permission/
  RolePermission/
  UserPermission        → roles / permissions / role_permissions /
                          member_roles / member_resource_permissions
                          (member_resource_permissions is actually a
                          SUPERSET of the BRD's UserPermission — it scopes
                          overrides to a specific resource, not just a
                          user+permission pair. Keep your version.)
  GithubInstallation     → provider_connections (generalised across
                          GitHub/GitLab/Bitbucket/Azure DevOps — good.
                          But it's missing 3 fields the sync engine
                          needs to *query directly*, not bury in JSON:
                          permissions snapshot, suspended_at, uninstalled_at.
                          Add these as real columns via ALTER TABLE —
                          "all sync operations are paused for suspended
                          installations" needs to be a WHERE clause,
                          not a JSON parse.)

─────────────────────────────────────────────────────────────
FLAG BEFORE YOU BUILD ON TOP OF THIS:
─────────────────────────────────────────────────────────────

  1. organizations.plan enum currently reads:
       FREE, PRO, TEAM, BUSINESS, ENTERPRISE
     Your monetization doc's actual tiers are:
       FREE, STARTER ($49), AGENCY ($199), STUDIO ($499), ENTERPRISE ($1,500+)
     These don't match. Decide now — rename the enum values or remap
     your pricing page — before Subscription/billing code starts
     reading organizations.plan, or you'll do a data migration later.

  2. cities, states, languages tables in your migration have no
     connection to anything in the Syncr domain model. They look like
     leftover boilerplate from a different starter template. Harmless
     to leave, but don't spend migration effort maintaining them for
     an MVP that doesn't use location data.

  3. ALTER TABLE for provider_connections (run alongside this file):

       ALTER TABLE "provider_connections"
         ADD COLUMN "permissions_snapshot" jsonb DEFAULT '{}'::jsonb,
         ADD COLUMN "suspended_at" timestamptz,
         ADD COLUMN "uninstalled_at" timestamptz;

     Sync operations must check suspended_at/uninstalled_at before
     running — this needs to be indexable, not nested in metadata jsonb.
*/
