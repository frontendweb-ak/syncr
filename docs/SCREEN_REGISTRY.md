# Syncr — Screen Registry
> Every UI screen needed for the actual MVP (SYNCR-ROADMAP.md's 12-item NOW list). APIs it calls, permissions required, real DB tables displayed.
> **Scope correction:** a prior version of this registry (SCREEN_REGISTRY_UPDATED.md) marked 134 screens as MVP, including full Billing, Security, Analytics, and Reports modules. Those are NEXT/LATER-tier per the roadmap and are not in this file. If a screen isn't listed here, it isn't MVP — the same "if it's not written here, don't build it yet" discipline the roadmap itself enforces for backend work now applies to screens too.

---

## Onboarding Flow

### SCREEN-001: Register
**Route:** `/auth/register` · **Feature:** FEAT-001
**APIs:** `POST /api/v1/auth/register`
**Permissions:** Public

### SCREEN-002: Login
**Route:** `/auth/login` · **Feature:** FEAT-002
**APIs:** `POST /api/v1/auth/login`
**Permissions:** Public

### SCREEN-003: Verify Email
**Route:** `/auth/verify-email` · **Feature:** FEAT-002
**APIs:** `GET /api/v1/auth/verify-email?token=`
**Permissions:** Public

### SCREEN-004: Forgot / Reset Password
**Route:** `/auth/forgot-password`, `/auth/reset-password` · **Feature:** FEAT-002
**APIs:** `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset-password`
**Permissions:** Public

### SCREEN-005: Accept Invitation
**Route:** `/invites/accept?token=` · **Feature:** FEAT-003
**APIs:** `POST /api/v1/organizations/invites/accept`
**Permissions:** Authenticated (any user — this is how a new teammate joins)

### SCREEN-006: Connect GitHub (Onboarding)
**Route:** `/onboarding/github` · **Feature:** FEAT-005
**APIs:** `GET /api/v1/github/install-url`
**Permissions:** `organization:manage_members`-tier (OWNER/ADMIN only — matches `requireOrgManager`)
**Real DB tables:** `provider_connections`
**Status:** Sprint 1 (in progress)

---

## Core App Screens

### SCREEN-007: Repositories
**Route:** `/dashboard/repos` · **Feature:** FEAT-006, FEAT-009
**APIs:** `GET /api/v1/organizations/:id/repos`
**Permissions:** org member (any active role)
**Real DB tables:** `repositories`, `repo_components`
**Key data:** name, per-component role (SOURCE/CONSUMER — now correctly per-component, not one flag per repo), syncScore, lastScannedAt, out-of-sync component count
**Status:** Sprint 2

### SCREEN-008: Component Registry
**Route:** `/dashboard/registry` · **Feature:** FEAT-007, FEAT-008
**APIs:** `GET /api/v1/organizations/:id/components`, `GET .../components/:id/versions`
**Permissions:** org member (any active role) for read; MEMBER+ for publish
**Real DB tables:** `components`, `component_versions`, `component_tags`
**Status:** Sprint 3

### SCREEN-009: Sync Proposals (PRs)
**Route:** `/dashboard/syncs` · **Feature:** FEAT-010, FEAT-011, FEAT-012
**APIs:** `GET /api/v1/organizations/:id/sync-proposals`, `POST .../approve`, `POST .../reject`
**Permissions:** MEMBER can approve non-breaking; **breaking proposals require a second, distinct approver with the same permission** — this is a quorum check on top of the permission check, not replaced by it
**Real DB tables:** `sync_proposals`, `sync_events`
**Critical UI:** red badge for `isBreaking`, distinct "needs second approval" state (not the same as a normal pending state)
**Status:** Sprint 7–8

### SCREEN-010: Minimal Dashboard Home
**Route:** `/dashboard` · **Feature:** FEAT-017
**APIs:** `GET /api/v1/organizations/:id/repos`, `GET .../sync-proposals?status=PENDING`
**Permissions:** org member
**Real DB tables:** `repositories`, `sync_proposals`
**Deliberately minimal:** one table (connected repos + drift status), per the roadmap's own wording — not a widget dashboard, not customizable, not the 6-screen Phase-3 dashboard from the prior inflated registry.
**Status:** Sprint 9

---

## Organization / Settings Screens

### SCREEN-011: Settings > Team
**Route:** `/dashboard/settings/team` · **Feature:** FEAT-003
**APIs:** `GET /api/v1/organizations/:id/members`, `POST .../invites`, `DELETE .../members/:id`
**Permissions:** `organization:manage_members` (OWNER/ADMIN) for invite/remove; any member for read
**Real DB tables:** `organization_members`, `organization_invites`, `roles`, `member_roles`

### SCREEN-012: Settings > API Tokens
**Route:** `/dashboard/settings/tokens` · **Feature:** FEAT-004
**APIs:** `GET /api/v1/api-keys`, `POST /api/v1/api-keys`, `DELETE /api/v1/api-keys/:id`
**Permissions:** authenticated (dashboard session only — a CLI holding a PAT cannot manage PATs, by design)
**Real DB tables:** `api_keys`

### SCREEN-013: Workspace Switcher
**Route:** header component, not a standalone page · **Feature:** FEAT-001
**APIs:** `GET /api/v1/organizations` (lists active org memberships)
**Permissions:** authenticated
**Real DB tables:** `organizations`, `organization_members`

---

## Explicitly out of scope for this registry (NEXT/LATER — do not build)

Billing/subscription screens, Security/CVE dashboard, Analytics, Reports, DORA metrics, Team performance, Dependency graphs, Consumer graphs, Job queue/worker health screens, Notification preferences, Feature flags UI, Audit log UI (backend table exists per DATABASE_INDEX.md; no screen until promoted off NEXT), Integrations beyond GitHub (Slack/Linear/Jira/Discord), Theme settings, Danger Zone.

**Every empty/loading/error state** still applies to the 13 screens above — build with each screen, not as separate tracked items.

---

## MVP Summary (corrected)

| Category | Screens |
|----------|---------|
| Onboarding | 6 |
| Core app | 4 |
| Org / Settings | 3 |
| **Total MVP screens** | **13** |
| Explicitly deferred (NEXT/LATER) | ~120+ (not itemized here — see PROJECT_INDEX.md backlog for feature-level deferral, not screen-level, since most of those features don't have designed screens yet) |

---

_Rebuilt 2026-08-30. The prior "updated" version of this registry counted 165 total screens with 134 marked MVP — that count does not match SYNCR-ROADMAP.md's 12-item NOW list and has been discarded, not reconciled. If a screen is genuinely needed for one of the 12 roadmap items and is missing from this list, add it here with its roadmap item number — don't add a screen because a feature might be nice._
