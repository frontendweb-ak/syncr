# Syncr — Sprint Tracker
> One sprint = 2 weeks, 2-engineer assumption (see PROJECT_INDEX.md — recheck if team size differs).
> Sprint numbering matches the MVP Execution Plan built from SYNCR-ROADMAP.md's NOW list — this supersedes the original Sprint 0–5 plan, which was written before auth and the core schema were actually complete.
> Update this file at the END of every day and END of every sprint.

---

## Why the sprint numbers reset

The original tracker's Sprint 0 ("Project Skeleton") assumed nothing was built yet. That's no longer true — auth and the core DB schema are done, ahead of that original plan. Renumbering from scratch here rather than trying to map old sprint numbers onto new work, because the dependency chain actually changed (e.g., component detection now correctly comes *after* the registry and CLI exist to detect against, not in Sprint 2 alongside GitHub App install).

---

## Completed (pre-tracker)

| Milestone | What shipped | Real tables/modules touched |
|-----------|--------------|------------------------------|
| Auth | Register/login/logout/refresh/MFA/password reset, device revocation, real RBAC-resolved JWT role claim | `users`, `devices`, `login_history`, `security_events` |
| Core schema | ~40-table Drizzle schema | All domains — identity, RBAC, org hierarchy, component registry, sync engine, scanning, audit |
| RBAC foundation | Four system roles, resource-level override, platform-staff flag | `roles`, `permissions`, `role_permissions`, `member_roles`, `member_resource_permissions`, `users.platformRole` |
| Org + invites | Transactional org bootstrap, invite-with-role, owner-orphan protection | `organizations`, `organization_members`, `organization_invites`, `workspaces`, `workspace_access` |
| API keys | CLI PAT lifecycle | `api_keys` |

## Sprint 0 — Foundation Fixes — ✅ CLOSED

```
Goal: Close three defects found in codebase review before building anything on top of them.
```
- [x] Deleted duplicate `syncStatus` Postgres enum declaration in `enums/sync.ts`
- [x] Moved SOURCE/CONSUMER role from `repositories.role` onto `repo_components`
- [x] Decided the environment-variables/secrets subsystem — documented, not silently left undocumented

---

## Current Sprint

```
Sprint:     1 — GitHub App Installation Flow
Goal:       An org can install the Syncr GitHub App and the connection is durably stored.
Roadmap:    Item #3
Progress:   ░░░░░░░░░░ 0%
```

### Sprint 1 Daily Log

| Day | Date | Built | Hours | Status |
|-----|------|-------|-------|--------|
| 1 | — | GitHub App manifest + OAuth callback route | — | ⏳ |
| 2 | — | `provider_connections` write path on successful install | — | ⏳ |
| 3 | — | Installation lifecycle webhooks (suspended/unsuspended/uninstalled) | — | ⏳ |
| 4 | — | Installation token refresh job | — | ⏳ |
| 5 | — | Repo listing endpoint (read-only, from GitHub API) | — | ⏳ |
| 6–10 | — | Buffer / testing / sprint review | — | ⏳ |

### Sprint 1 Acceptance Criteria
- [ ] Org owner can complete the GitHub App install flow end-to-end
- [ ] `provider_connections` row correctly reflects installation ID, account, permissions snapshot
- [ ] Uninstalling on GitHub's side flips `status` within one webhook delivery
- [ ] Installation token refreshes automatically before expiry (needed before Sprint 2 can call the GitHub API reliably)

---

## Planned Sprints (full plan lives in the MVP Execution Plan document — summarized here for daily tracking)

| Sprint | Goal | Roadmap # | Version checkpoint |
|--------|------|-----------|---------------------|
| 2 | Webhook ingestion, idempotent by deliveryId; `repositories` populated from push events | #4 | v0.1.0 |
| 3 | Component registry CRUD (publish/version/tag), storage integration | #5 | — |
| 4 | CLI: login, publish, pull | #6 | — |
| 5 | CLI: create, init (brownfield onboarding) | #7, #8 | v0.3.0 |
| 6 | Detection algorithm (3-tier), tested against an internal accuracy corpus | #9 | — |
| 7 | Drift → SyncProposal generation | #10 | v0.5.0 |
| 8 | PR automation, breaking-change quorum enforcement | #11 | — |
| 9 | Minimal dashboard (repos + drift status, one table) | #12 | v0.8.0 — first real-agency pilot candidate |
| 10 | Hardening against pilot feedback | — | v1.0.0 — MVP launch |

**Explicitly not scheduled:** CVE scanner, Stripe billing, custom RBAC roles, outbound webhooks — all NEXT-tier, gated on a real paying customer per SYNCR-ROADMAP.md.

---

## Sprint History

| Sprint | Goal | Status | Notes |
|--------|------|--------|-------|
| Pre-tracker | Auth + core schema | ✅ Done | Completed before this tracker was rebuilt — see "Completed (pre-tracker)" above |
| Sprint 0 | Foundation fixes | ✅ Done | 3 defects closed, ~2–3 days |
| Sprint 1 | GitHub App install | 🔄 In Progress | Current |

---

_Rebuilt 2026-08-30. The original tracker's Sprint 2–5 plan (GitHub App / Registry / PR Automation / Dashboard+CVE, compressed into 4 sprints) has been replaced by the more granular 10-sprint MVP Execution Plan, which separates CLI work, detection, and PR automation into their own sprints rather than bundling "the core feature" into a single 2-week block._
