# Syncr — Feature Registry
> Every MVP feature, with full traceability: real DB tables → real APIs → UI screens.
> Scope = SYNCR-ROADMAP.md's 12-item NOW list only. NEXT/LATER features are named in PROJECT_INDEX.md but not detailed here until they're promoted to NOW.
> Status values: PLANNED | IN PROGRESS | DONE

---

## DOMAIN 1: Identity & Access — ✅ DONE (built ahead of the original Sprint 2 estimate)

### FEAT-001: User Registration
**Status:** DONE
**Description:** New user registers with email + password, inside one transaction: user row, credential, PASSWORD provider link, personal organization, OWNER membership, OWNER role assignment, default workspace, workspace access.
**Real DB tables:** `users`, `organization_members`, `organizations`, `roles`, `member_roles`, `workspaces`, `workspace_access`
**API routes:** `POST /api/v1/auth/register`
**Corrects:** the original registry listed this against `User, Org, OrgMember, Role, Subscription` — `Subscription` doesn't apply (no billing at registration) and the real table names differ throughout.

### FEAT-002: Login / Session
**Status:** DONE
**Description:** Email/password and Google OAuth login, device-fingerprinted sessions, MFA challenge step, JWT with a real resolved role claim (not hardcoded).
**Real DB tables:** `users`, `devices`, `login_history`, `security_events`
**API routes:** `POST /api/v1/auth/login`, `POST /api/v1/auth/oauth/google`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, `POST /api/v1/auth/logout-all`
**Corrects:** original listed `Session` — the real implementation uses `devices` as the session/refresh-token record, with `tokenVersion` fields on both `users` and `devices` for independent global vs. per-device revocation.

### FEAT-003: Team Invitations
**Status:** DONE
**Description:** OWNER/ADMIN invites by email with an optional role; token-hashed invite link; accept flow atomically activates or creates membership, assigns the invited role (falling back to MEMBER), and grants default workspace access.
**Real DB tables:** `organization_invites`, `organization_members`, `member_roles`, `workspace_access`
**API routes:** `POST /api/v1/organizations/:organizationId/invites`, `POST /api/v1/organizations/invites/accept`, `POST .../resend`, `DELETE .../:inviteId`
**Corrects:** original table name `Invitation` → real table is `organization_invites`, and it includes a `roleId` column (added during review) the original design didn't have.

### FEAT-004: API Token Management (CLI PATs)
**Status:** DONE
**Description:** Dashboard-only creation of CLI personal access tokens. `syncr_live_<prefix>.<secret>` format, SHA-256 hashed, ownership-checked revocation, ACTIVE/REVOKED/EXPIRED lifecycle.
**Real DB tables:** `api_keys`
**API routes:** `POST /api/v1/api-keys`, `GET /api/v1/api-keys`, `DELETE /api/v1/api-keys/:apiKeyId`
**Corrects:** original table name `ApiToken` → real table is `api_keys`. Original said "bcrypt hash" — real implementation uses SHA-256, which is correct for a high-entropy machine-generated token (not a human password), matching the same reasoning already used for `password_reset_tokens.tokenHash`.

---

## DOMAIN 2: GitHub Integration — 🔄 IN PROGRESS (Sprint 1 of 10)

### FEAT-005: GitHub App Installation
**Status:** IN PROGRESS — roadmap item #3, this sprint's active work
**Description:** Org installs the Syncr GitHub App; OAuth callback stores the installation; installation lifecycle webhooks (suspended/unsuspended/uninstalled) keep the connection record current; token refresh job keeps the short-lived installation token valid.
**Real DB tables:** `provider_connections` (schema already exists — this is the service/route/callback layer being built now)
**API routes (planned):** `GET /api/v1/github/install-url`, `GET /api/v1/github/callback`
**Corrects:** original table name `GithubInstallation` → real table is `provider_connections`, deliberately named provider-agnostically even though GitHub is the only provider implemented — this anticipates (but does not build) GitLab/Bitbucket support, which stays in LATER.
**Security:** HMAC webhook signature verification mandatory before any payload is processed — unchanged from original, still correct.

### FEAT-006: Repository Connection
**Status:** PLANNED — Sprint 2
**Description:** Repositories sync into the `repositories` table from push/installation webhook events, linked through `provider_connections`.
**Real DB tables:** `repositories`, `repo_components`, `provider_connections`
**API routes (planned):** `GET /api/v1/organizations/:id/repos`
**Corrects:** original said role (SOURCE/CONSUMER) lived on `Repo` — this was a real, confirmed bug (a repo can be SOURCE for one component and CONSUMER for another simultaneously, which a single column on `repositories` cannot represent). Fixed during Sprint 0: role now belongs on `repo_components`.

### FEAT-009: Component Detection (Auto-scan)
**Status:** PLANNED — Sprint 6 (moved later than original Sprint 2 estimate — detection needs a populated registry to detect against, see dependency chain in PROJECT_INDEX.md)
**Description:** 3-tier detection: filename matching → import-path matching → content-hash matching, combined into a confidence score written to `repo_components`.
**Real DB tables:** `repositories`, `repo_components`, `components`, `component_versions`, `github_webhook_events`
**Note:** flagged in the Strategic Position review as the single riskiest unbuilt piece of the entire roadmap — every downstream feature's value depends on this being accurate, not just functional. Definition of done is measured false-positive/false-negative rate against a test corpus, not "runs without crashing."

---

## DOMAIN 3: Component Registry — 📋 PLANNED (Sprint 3–5)

### FEAT-007: Component Publishing (CLI)
**Status:** PLANNED — Sprint 3 (API) / Sprint 4 (CLI)
**Description:** `syncr publish` packages a directory, uploads to storage, registers an immutable `component_versions` row (content-hash deduped, no updates after creation — matches DEC-010, confirmed still correct against the real schema).
**Real DB tables:** `components`, `component_versions`, `audit_logs`
**API routes (planned):** `POST /api/v1/organizations/:id/components`, `POST .../components/:id/versions`

### FEAT-008: Component Pull (CLI)
**Status:** PLANNED — Sprint 4
**Description:** `syncr pull <component>` downloads a specific version.
**Real DB tables:** `components`, `component_versions`, `repo_components`
**API routes (planned):** `GET /api/v1/organizations/:id/components/:id/versions/:version/download`

---

## DOMAIN 4: Sync Engine — 📋 PLANNED (Sprint 7–8)

### FEAT-010: Drift Detection → SyncProposal
**Status:** PLANNED — Sprint 7
**Description:** Confirmed drift (from FEAT-009) creates a `sync_proposals` row, respecting one-open-proposal-per-(repo,component), with a `sync_events` row logged from creation.
**Real DB tables:** `sync_proposals`, `sync_events`, `repo_components`, `component_versions`

### FEAT-011: Automatic PR Generation
**Status:** PLANNED — Sprint 8
**Description:** Real GitHub PR opened per proposal via the installation token; idempotent (never opens a duplicate PR for the same proposal); PR status webhooks flip proposal status on merge/close.
**Real DB tables:** `sync_proposals`, `sync_events`

### FEAT-012: Sync PR Approval / Rejection
**Status:** PLANNED — Sprint 8
**Description:** Approve/reject through the dashboard, enforced through the real RBAC module (not a placeholder permission check). Breaking-change proposals require a second, distinct approver — a quorum rule enforced at PR-creation time, not just a flat `sync_proposal:approve` permission check.
**Real DB tables:** `sync_proposals`, `sync_events`, `audit_logs`
**Uses:** the RBAC resolution already built (roles → role_permissions → member_resource_permissions override chain).

---

## DOMAIN 5: Dashboard — 📋 PLANNED (Sprint 9)

### FEAT-017: Minimal Dashboard
**Status:** PLANNED — Sprint 9
**Description:** One table: connected repos, drift status, open proposal count. Proposal detail view with approve/reject wired to real RBAC. Read-only audit view off `sync_events`/`audit_logs`. **Deliberately minimal** — this is not the 134-screen dashboard from the earlier (incorrect) SCREEN_REGISTRY_UPDATED.md; seeSCREEN_REGISTRY.md for the corrected, roadmap-scoped screen list.
**Real DB tables:** `repositories`, `sync_proposals`, `sync_events`, `audit_logs`

---

## Explicitly NOT in this registry (NEXT/LATER — see PROJECT_INDEX.md backlog)

CVE scanning (`scans`, `vulnerabilities` — tables exist in schema, feature not built), billing/Stripe (`subscriptions` — table does not exist yet), custom RBAC roles beyond the four system roles, outbound webhooks, component marketplace, AI-assisted generation, multi-provider support, SSO/SAML.

---

_Rebuilt 2026-08-30. Original registry used FEAT-013 through FEAT-016 for CVE/billing features scheduled at Sprint 4–5 — those are correctly NEXT-tier per the current roadmap and have been removed from this MVP-scoped registry, not renumbered around._
