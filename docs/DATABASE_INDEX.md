# Syncr — Database Index
> Every real table, its purpose, which features use it, its status.
> ORM: Drizzle (not Prisma — see DECISION_LOG.md DEC-013 for the correction).

---

## Model Map

| Table | Domain | Features that use it | Status |
|-------|--------|----------------------|--------|
| `users` | Identity | FEAT-001–004 | Schema done, includes `platformRole` |
| `devices` | Identity | FEAT-002 | Schema done — session/refresh-token record, not a separate `Session` table |
| `login_history`, `security_events` | Identity | FEAT-002 | Schema done |
| `user_auth_providers` | Identity | FEAT-001, FEAT-002 | Schema done — multi-provider linking (password/Google/etc.) |
| `passkeys` | Identity | — | Schema done, **unused by design** — table exists, flow deliberately not built (see DECISION_LOG DEC-014) |
| `password_reset_tokens` | Identity | FEAT-002 | Schema done |
| `roles`, `permissions`, `role_permissions` | RBAC | All authenticated features | Schema done — four system roles seeded: OWNER, ADMIN, MEMBER, VIEWER |
| `member_roles` | RBAC | All authenticated features | Schema done — many-to-many, a member can hold multiple roles |
| `member_resource_permissions` | RBAC | Resource-level overrides | Schema done — the one escape hatch beyond role-based access |
| `organizations` | Organisation | FEAT-001, FEAT-003 | Schema done — includes `isPersonal` flag |
| `organization_members` | Organisation | FEAT-001, FEAT-003 | Schema done |
| `organization_invites` | Organisation | FEAT-003 | Schema done — includes `roleId` (added during review) and `resentCount` (integer, was previously a real bug as text) |
| `workspaces`, `workspace_access` | Organisation | FEAT-001 | Schema done — sits between organization and project, not present in the original (incorrect) flat-tenant model |
| `projects` | Organisation | — | Schema done — sits between workspace and repository |
| `api_keys` | Infrastructure | FEAT-004 | Schema done — **not** `ApiToken` |
| `provider_connections` | GitHub | FEAT-005 | Schema done — **not** `GithubInstallation`; provider-agnostic naming |
| `github_webhook_events` | GitHub | FEAT-005, FEAT-009 | Schema done — delivery-ID deduped |
| `repositories` | Repository | FEAT-006, FEAT-009 | Schema done — role now correctly lives on `repo_components`, not here (Sprint 0 fix) |
| `components` | Registry | FEAT-007, FEAT-008, FEAT-009 | Schema done |
| `component_versions` | Registry | FEAT-007, FEAT-008 | Schema done — immutable after creation (DEC-010, confirmed correct) |
| `component_tags` | Registry | FEAT-007 | Schema done |
| `repo_components` | Registry + Sync | FEAT-009, FEAT-010 | Schema done — now carries the SOURCE/CONSUMER role per (repo, component) pair |
| `sync_proposals` | Sync | FEAT-010, FEAT-011, FEAT-012 | Schema done |
| `sync_events` | Sync | FEAT-010, FEAT-011, FEAT-012 | Schema done |
| `scans`, `vulnerabilities` | Security | NEXT-tier, not FEAT-0xx yet | Schema exists, **feature not built** — do not build the service layer until CVE scanning is promoted off NEXT |
| `audit_logs` | Infrastructure | All governed mutations | Schema done — BigInt/bigserial PK confirmed correct for strict insertion ordering (DEC-009) |

### Tables that do NOT exist yet (do not reference these in any new doc or code)

`Session` (real equivalent: `devices`), `GithubInstallation` (real: `provider_connections`), `ApiToken` (real: `api_keys`), `Invitation` (real: `organization_invites`), `UserPermission` (real: `member_resource_permissions`), `Subscription`, `WebhookEndpoint`, `WebhookDelivery`, `FeatureFlag`, `Team`/`TeamMember`, `QualityCheck`, `SecretFinding`, `LicenseFinding`, `AllowlistRule`, `Report`, `NotificationPreference`, `Deployment`, `Issue`, `PipelineRun`, `RepoStats`, `ActivityEvent`, `Alert`. These all appeared in the prior (incorrect) planning docs' 165-screen scope and do not exist in the real schema. If a future sprint needs one of these, it gets designed and added here — not assumed to already exist.

---

## Undocumented-but-real: environment/secrets subsystem

`project_settings`, `project_environments`, `environment_variables`, `environment_secrets` exist in the live schema. Per the Sprint 0 decision, this is **documented here as an intentionally deferred, unbuilt feature** — a Vercel/Doppler-shaped per-project secrets manager — rather than left silently undocumented, which was the state that triggered the original codebase review flag. No feature registry entry exists for it; it stays LATER-tier until a persona and BRD use case are written for it.

---

## Seed Data

| Table | Seed data | Notes |
|-------|-----------|-------|
| `roles` | OWNER, ADMIN, MEMBER, VIEWER (system roles, `organizationId = NULL`) | Slugs defined in `SYSTEM_ROLE_SLUGS` — single source of truth referenced by org-creation and invite-accept code, not hardcoded strings scattered across services |
| `permissions` | `resource:action` pairs (name is a **generated column**, `'syncr:' \|\| resource \|\| ':' \|\| action` — cannot drift from the resource/action columns, fixed during review) | |
| `role_permissions` | OWNER → all; ADMIN → all except billing; MEMBER → repo/component/sync read-write; VIEWER → read-only | Matches the resource matrix worked out during the RBAC review |

**Critical:** these seed rows must exist before any registration succeeds — `OrganizationService.bootstrapOwnerMembership` throws a loud, explicit error (`systemRoleMissing`) rather than silently creating a member with zero roles if the OWNER system role is missing.

---

## Index Strategy — corrected

| Table | Index | Query it supports | Note |
|-------|-------|--------------------|------|
| `users` | `lower(email)` unique | Login lookup | |
| `organizations` | `lower(slug)` unique | URL routing | |
| `organizations` | `(ownerUserId)` unique **partial**, `WHERE isPersonal = true` | "One personal org per user" | **Fixed during review** — was a composite unique on `(ownerUserId, isPersonal)`, which capped every user at ~2 orgs total, not 1 personal org. Partial index is the correct shape. |
| `workspaces` | `(organizationId)` unique **partial**, `WHERE isDefault = true` | "One default workspace per org" | Same bug class, same fix |
| `roles` | `lower(slug)` unique **partial**, `WHERE organizationId IS NULL` (system) + `(organizationId, lower(slug))` unique **partial**, `WHERE organizationId IS NOT NULL` (custom) | Prevents duplicate system role slugs | **Fixed during review** — a single non-partial index gave zero duplicate protection to system roles, since Postgres never treats `NULL = NULL` as a collision |
| `organization_members` | `(organizationId, userId)` unique | Membership check | |
| `repositories` | `(providerConnectionId)` | "List repos for a connection" | |
| `components` | `(workspaceId, lower(slug))` unique | CLI push/pull lookup | |
| `repo_components` | `(repoId, componentId)` unique | Drift detection idempotency | |
| `sync_proposals` | one-open-proposal-per-(repo,component) | Prevents duplicate proposals on repeat detection runs | |
| `github_webhook_events` | `(deliveryId)` unique | Duplicate delivery prevention | |
| `audit_logs` | `(organizationId, createdAt DESC)` | Audit log pagination | |

---

_Rebuilt 2026-08-30 against src.zip. The original index listed 25 Prisma models; the real schema has ~40 Drizzle tables across a deeper tenancy hierarchy. Every table name above was verified against actual schema files, not assumed from the old plan._
