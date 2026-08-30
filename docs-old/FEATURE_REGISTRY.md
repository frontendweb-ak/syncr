# Syncr — Feature Registry
> Every feature Syncr will ever have. Full traceability: DB models → APIs → Workers → UI screens.
> Status: IDEA | RESEARCH | SPEC | ARCH | DB | API | WORKER | FRONTEND | TESTING | DONE

---

## DOMAIN 1: Identity & Access

### FEAT-001: User Registration
**Status:** PLANNED | **Priority:** P0 | **Sprint:** 2
**Description:** New user signs up with email + password. Creates user record and personal org in one transaction.
**User Story:** As a developer, I want to create a Syncr account so I can start connecting my repos.
**DB Models:** User, Org, OrgMember, Role, Subscription
**API Routes:** POST /auth/register
**Worker Jobs:** None
**UI Screens:** SCREEN-001 (Register page)
**Events emitted:** user.registered, org.created
**Permissions required:** Public
**Dependencies:** PKG-001 (core), PKG-002 (database), PKG-004 (auth)
**Tests needed:** Registration success, duplicate email rejected, weak password rejected, org created atomically

---

### FEAT-002: User Login / Session
**Status:** PLANNED | **Priority:** P0 | **Sprint:** 2
**Description:** Existing user logs in. Better Auth creates session. JWT returned for API calls. CLI uses API tokens instead.
**DB Models:** User, Session
**API Routes:** POST /auth/login, POST /auth/logout, GET /auth/me
**Worker Jobs:** None
**UI Screens:** SCREEN-002 (Login page)
**Events emitted:** user.logged_in
**Permissions required:** Public
**Dependencies:** FEAT-001

---

### FEAT-003: Team Invitations
**Status:** PLANNED | **Priority:** P1 | **Sprint:** 3
**Description:** Org owner/admin invites team member by email. Invitation email sent with secure token. Recipient clicks link, creates account or logs in, joins org with specified role.
**DB Models:** Invitation, OrgMember, User
**API Routes:** POST /v1/orgs/:id/invitations, GET /v1/invitations/:token, POST /v1/invitations/:token/accept
**Worker Jobs:** Send invitation email (inline SES call — no queue needed at this scale)
**UI Screens:** SCREEN-010 (Settings > Team), SCREEN-011 (Accept invitation page)
**Events emitted:** invitation.sent, member.joined
**Permissions required:** member:invite
**Dependencies:** FEAT-001, FEAT-002

---

### FEAT-004: API Token Management
**Status:** PLANNED | **Priority:** P1 | **Sprint:** 4
**Description:** Users create scoped API tokens for CLI use. Tokens are shown once, stored as bcrypt hash. CLI uses Bearer token auth.
**DB Models:** ApiToken, User, Org
**API Routes:** GET /v1/orgs/:id/tokens, POST /v1/orgs/:id/tokens, DELETE /v1/orgs/:id/tokens/:tokenId
**Worker Jobs:** None
**UI Screens:** SCREEN-012 (Settings > API Tokens)
**Events emitted:** token.created, token.revoked
**Permissions required:** token:create, token:revoke
**Dependencies:** FEAT-002

---

## DOMAIN 2: GitHub Integration

### FEAT-005: GitHub App Installation
**Status:** PLANNED | **Priority:** P0 | **Sprint:** 2
**Description:** User installs the Syncr GitHub App on their GitHub org. GitHub sends installation.created webhook. Syncr stores the installation and lists all repos.
**DB Models:** GithubInstallation, GithubWebhookEvent, Repo, Org
**API Routes:** GET /v1/orgs/:id/github/install-url (returns GitHub App install URL)
**Worker Jobs:** Initial repo scan triggered on installation
**UI Screens:** SCREEN-003 (Connect GitHub — onboarding step 1)
**Events emitted:** github.installed, repos.discovered
**Permissions required:** repo:connect
**Dependencies:** FEAT-001, PKG-005 (packages/github)
**Security:** HMAC webhook signature verification mandatory before any processing

---

### FEAT-006: Repository Connection
**Status:** PLANNED | **Priority:** P0 | **Sprint:** 3
**Description:** After GitHub App installed, user selects which repos are SOURCE (design system) and which are CONSUMER (client apps). Syncr scans connected repos for components.
**DB Models:** Repo, RepoComponent, GithubInstallation
**API Routes:** GET /v1/orgs/:id/repos, POST /v1/orgs/:id/repos, PATCH /v1/orgs/:id/repos/:id, DELETE /v1/orgs/:id/repos/:id
**Worker Jobs:** Component detection scan on repo connect
**UI Screens:** SCREEN-004 (Repositories page), SCREEN-005 (Connect repo modal)
**Events emitted:** repo.connected, repo.scanned
**Permissions required:** repo:connect, repo:read
**Dependencies:** FEAT-005

---

## DOMAIN 3: Component Registry

### FEAT-007: Component Publishing (CLI)
**Status:** PLANNED | **Priority:** P0 | **Sprint:** 3
**Description:** Developer runs `syncr component push` in terminal. CLI creates tar.gz, gets presigned S3 URL from API, uploads directly to S3, registers metadata. New version is created.
**DB Models:** Component, ComponentVersion, AuditLog
**API Routes:** POST /v1/orgs/:id/components, POST /v1/orgs/:id/components/:id/versions
**Worker Jobs:** After publish: detect all consumer repos using this component, create SyncProposals
**UI Screens:** SCREEN-006 (Registry page — shows new version)
**Events emitted:** component.published
**Permissions required:** component:publish
**Dependencies:** FEAT-006, CLI-001, PKG-006 (storage)
**Critical:** Immutable versions — once published, a version cannot be overwritten

---

### FEAT-008: Component Pull (CLI)
**Status:** PLANNED | **Priority:** P0 | **Sprint:** 3
**Description:** Developer runs `syncr component pull button`. CLI calls API to get latest version metadata + presigned S3 download URL. Downloads and extracts to local project.
**DB Models:** Component, ComponentVersion, RepoComponent
**API Routes:** GET /v1/orgs/:id/components, GET /v1/orgs/:id/components/:id, GET /v1/orgs/:id/components/:id/versions/:version/download
**Worker Jobs:** None
**UI Screens:** None (CLI only)
**Events emitted:** component.downloaded
**Permissions required:** component:read
**Dependencies:** FEAT-007

---

### FEAT-009: Component Detection (Auto-scan)
**Status:** PLANNED | **Priority:** P0 | **Sprint:** 2
**Description:** When a repo is connected or a push event arrives, Syncr scans the repo file tree to detect which registry components are present. Updates RepoComponent table.
**DB Models:** Repo, RepoComponent, Component, GithubWebhookEvent
**API Routes:** POST /v1/orgs/:id/repos/:id/scan (manual trigger)
**Worker Jobs:** Detection runs as Lambda triggered by SQS on push webhook
**UI Screens:** SCREEN-004 (Repos — shows sync status per repo)
**Events emitted:** repo.scanned, component.detected
**Permissions required:** repo:scan
**Dependencies:** FEAT-006, PKG-005 (github)
**Detection strategies (v1):** File name matching. Future: import path analysis, content hash.

---

## DOMAIN 4: Sync Engine

### FEAT-010: Drift Detection
**Status:** PLANNED | **Priority:** P0 | **Sprint:** 4
**Description:** After a new component version is published, Syncr compares usedVersion vs latestVersion in RepoComponent for all consumer repos. Creates SyncProposal for each stale repo.
**DB Models:** SyncProposal, SyncEvent, RepoComponent, ComponentVersion
**API Routes:** GET /v1/orgs/:id/sync-proposals (list), GET /v1/orgs/:id/sync-proposals/:id
**Worker Jobs:** Triggered by component.published event via SQS
**UI Screens:** SCREEN-007 (Sync PRs page)
**Events emitted:** sync.proposed
**Permissions required:** sync:read
**Dependencies:** FEAT-007, FEAT-009

---

### FEAT-011: Automatic PR Generation
**Status:** PLANNED | **Priority:** P0 | **Sprint:** 4
**Description:** The core Syncr feature. For each SyncProposal, the PR generator worker creates a branch, commits the updated component file, and opens a PR on GitHub. PR body includes diff, changelog, breaking change warning.
**DB Models:** SyncProposal, SyncEvent, Repo, Component, ComponentVersion
**API Routes:** None (triggered by worker, status visible via sync proposals API)
**Worker Jobs:** pr-generator — SQS triggered, one invocation per proposal
**UI Screens:** SCREEN-007 (shows PR URL, status, breaking flag)
**Events emitted:** sync.pr_opened
**Permissions required:** N/A (system action)
**Dependencies:** FEAT-010, PKG-005 (github)
**Critical:** Idempotent — if PR already exists for this proposal, skip. Never open duplicate PRs.

---

### FEAT-012: Sync PR Approval / Rejection
**Status:** PLANNED | **Priority:** P0 | **Sprint:** 4
**Description:** Agency lead reviews pending sync PRs in dashboard. Can approve (Syncr merges PR via GitHub API), reject (Syncr closes PR), or bulk approve multiple at once.
**DB Models:** SyncProposal, SyncEvent, AuditLog
**API Routes:** POST /v1/orgs/:id/sync-proposals/:id/approve, POST /v1/orgs/:id/sync-proposals/:id/reject, POST /v1/orgs/:id/sync-proposals/bulk-approve
**Worker Jobs:** merge-pr triggered on approval
**UI Screens:** SCREEN-007 (Sync PRs — approval UI with checkboxes)
**Events emitted:** sync.approved, sync.rejected, sync.merged
**Permissions required:** sync:approve, sync:reject, sync:bulk_approve
**Dependencies:** FEAT-011

---

## DOMAIN 5: Security

### FEAT-013: CVE Scanner
**Status:** PLANNED | **Priority:** P1 | **Sprint:** 5
**Description:** Daily scan of all connected repos. For each repo: fetch package.json from GitHub, query OSV.dev API for each dependency, store results as Vulnerability rows. Update repo health score.
**DB Models:** Scan, Vulnerability, Repo, AuditLog
**API Routes:** GET /v1/orgs/:id/vulnerabilities, GET /v1/orgs/:id/vulnerabilities/summary, POST /v1/orgs/:id/repos/:id/scan
**Worker Jobs:** cve-scanner — EventBridge daily trigger → SQS → Lambda per repo
**UI Screens:** SCREEN-008 (Security dashboard)
**Events emitted:** scan.completed, vulnerability.detected
**Permissions required:** vulnerability:read, repo:scan
**Dependencies:** FEAT-006, PKG-007 (queue)
**External API:** OSV.dev (free, no auth required)
**Idempotency:** @@unique([repoId, cveId]) prevents duplicate vulnerability rows

---

### FEAT-014: CVE Alerts (Email)
**Status:** PLANNED | **Priority:** P1 | **Sprint:** 5
**Description:** When a Critical CVE is detected, immediately send an email to the org owner. Weekly digest email every Monday 9am with org security summary.
**DB Models:** Vulnerability, Org, User
**API Routes:** None (triggered by worker events)
**Worker Jobs:** alert-sender — triggered by vulnerability.detected event
**UI Screens:** SCREEN-008 (Security dashboard — shows alert history)
**Events emitted:** alert.sent
**Permissions required:** N/A (system action)
**Dependencies:** FEAT-013
**Email provider:** AWS SES (already known from TGAC project)

---

### FEAT-015: CVE Patch PR Generation
**Status:** PLANNED | **Priority:** P1 | **Sprint:** 5
**Description:** For Critical and High CVEs, automatically generate a PR that updates the vulnerable package to the patched version in package.json.
**DB Models:** Vulnerability, Repo, AuditLog
**API Routes:** POST /v1/orgs/:id/vulnerabilities/:id/patch
**Worker Jobs:** patch-pr-generator — triggered on demand or automatically for Critical
**UI Screens:** SCREEN-008 (Security — "Generate Patch PR" button)
**Events emitted:** vulnerability.patch_pr_opened
**Permissions required:** vulnerability:patch
**Dependencies:** FEAT-013, PKG-005 (github)

---

## DOMAIN 6: Billing

### FEAT-016: Stripe Subscription
**Status:** PLANNED | **Priority:** P1 | **Sprint:** 4
**Description:** Stripe Checkout for plan upgrades. Webhook handler for subscription lifecycle events. Feature gating based on org.plan.
**DB Models:** Subscription, Org, AuditLog
**API Routes:** POST /v1/billing/checkout, POST /v1/billing/portal, POST /webhooks/stripe
**Worker Jobs:** None (synchronous webhook processing)
**UI Screens:** SCREEN-009 (Settings > Billing)
**Events emitted:** subscription.created, subscription.updated, subscription.canceled
**Permissions required:** org:manage_billing
**Dependencies:** FEAT-001
**Plans:** FREE (3 repos) | STARTER $49 (5 repos) | AGENCY $199 (25 repos) | STUDIO $499 (100 repos) | ENTERPRISE custom

---

## DOMAIN 7: Dashboard UI

### FEAT-017: Dashboard Overview Page
**Status:** PLANNED | **Priority:** P1 | **Sprint:** 5
**Description:** Main landing page after login. Shows: repo count, open sync PRs, stale components, critical CVEs. Portfolio health table. Recent activity feed.
**DB Models:** Org, Repo, SyncProposal, Vulnerability, AuditLog
**API Routes:** GET /v1/orgs/:id, GET /v1/orgs/:id/repos, GET /v1/orgs/:id/sync-proposals, GET /v1/orgs/:id/vulnerabilities/summary
**Worker Jobs:** None
**UI Screens:** SCREEN-000 (Dashboard home)
**Permissions required:** org:read
**Dependencies:** FEAT-006, FEAT-010, FEAT-013

---

_Last updated: 2025-06-26 | Features: 17 defined | More to be added as sprints progress_
