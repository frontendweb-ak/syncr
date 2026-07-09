# Syncr — Screen Registry
> Every UI screen in the dashboard. APIs it calls, permissions required, DB models displayed.

---

## Onboarding Flow

### SCREEN-000: Dashboard Home
**Route:** /dashboard
**Feature:** FEAT-017
**APIs called:** GET /v1/orgs/:id, GET /v1/orgs/:id/repos, GET /v1/orgs/:id/sync-proposals?status=OPEN, GET /v1/orgs/:id/vulnerabilities/summary
**Permissions:** org:read
**DB Models displayed:** Org, Repo, SyncProposal, Vulnerability
**Components:** StatCards (4), PortfolioHealthTable, ActivityFeed
**Status:** PLANNED

### SCREEN-001: Register
**Route:** /auth/register
**Feature:** FEAT-001
**APIs called:** POST /auth/register
**Permissions:** Public
**Status:** PLANNED

### SCREEN-002: Login
**Route:** /auth/login
**Feature:** FEAT-002
**APIs called:** POST /auth/login
**Permissions:** Public
**Status:** PLANNED

### SCREEN-003: Connect GitHub (Onboarding Step 1)
**Route:** /onboarding/github
**Feature:** FEAT-005
**APIs called:** GET /v1/orgs/:id/github/install-url
**Permissions:** repo:connect
**Status:** PLANNED

---

## Core App Screens

### SCREEN-004: Repositories
**Route:** /dashboard/repos
**Feature:** FEAT-006, FEAT-009
**APIs called:** GET /v1/orgs/:id/repos
**Permissions:** repo:read
**DB Models:** Repo, RepoComponent
**Key data:** name, role, healthScore, syncScore, lastScannedAt, stale component count
**Status:** PLANNED

### SCREEN-005: Connect Repo Modal
**Route:** Modal on SCREEN-004
**Feature:** FEAT-006
**APIs called:** POST /v1/orgs/:id/repos
**Permissions:** repo:connect
**Status:** PLANNED

### SCREEN-006: Component Registry
**Route:** /dashboard/registry
**Feature:** FEAT-007, FEAT-008
**APIs called:** GET /v1/orgs/:id/components, GET /v1/orgs/:id/components/:id/versions
**Permissions:** component:read
**Key data:** name, slug, framework, latestVersion, repoUsageCount, isDeprecated
**Status:** PLANNED

### SCREEN-007: Sync PRs
**Route:** /dashboard/syncs
**Feature:** FEAT-010, FEAT-011, FEAT-012
**APIs called:** GET /v1/orgs/:id/sync-proposals, POST .../approve, POST .../reject, POST .../bulk-approve
**Permissions:** sync:read, sync:approve, sync:reject, sync:bulk_approve
**Key data:** component name, from/to version, target repo, isBreaking, status, githubPrUrl
**Critical UI:** Checkbox for bulk select. Red badge for breaking changes. Conflict warning state.
**Status:** PLANNED

### SCREEN-008: Security Dashboard
**Route:** /dashboard/security
**Feature:** FEAT-013, FEAT-014, FEAT-015
**APIs called:** GET /v1/orgs/:id/vulnerabilities, GET /v1/orgs/:id/vulnerabilities/summary
**Permissions:** vulnerability:read
**Key data:** cveId, severity, packageName, affectedRepos count, status, patchPrUrl
**Status:** PLANNED

### SCREEN-009: Settings > Billing
**Route:** /dashboard/settings/billing
**Feature:** FEAT-016
**APIs called:** GET /v1/orgs/:id, POST /v1/billing/checkout, POST /v1/billing/portal
**Permissions:** org:manage_billing
**Status:** PLANNED

### SCREEN-010: Settings > Team
**Route:** /dashboard/settings/team
**Feature:** FEAT-003
**APIs called:** GET /v1/orgs/:id/members, POST /v1/orgs/:id/invitations, DELETE /v1/orgs/:id/members/:id
**Permissions:** org:read, member:invite, member:remove
**Status:** PLANNED

### SCREEN-011: Accept Invitation
**Route:** /invitations/:token
**Feature:** FEAT-003
**APIs called:** GET /v1/invitations/:token, POST /v1/invitations/:token/accept
**Permissions:** Public
**Status:** PLANNED

### SCREEN-012: Settings > API Tokens
**Route:** /dashboard/settings/tokens
**Feature:** FEAT-004
**APIs called:** GET /v1/orgs/:id/tokens, POST /v1/orgs/:id/tokens, DELETE /v1/orgs/:id/tokens/:id
**Permissions:** token:create, token:revoke
**Status:** PLANNED

---

_Last updated: 2025-06-26 | 13 screens defined_
