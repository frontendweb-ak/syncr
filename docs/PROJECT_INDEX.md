# Syncr — Project Index
> **This file is the source of truth for everything Syncr.**
> Rebuilt 2026-08-30 against the actual codebase and SYNCR-ROADMAP.md — see HOW_TO_USE_THIS_SYSTEM.md for why this rebuild happened and how to keep it from drifting again.

## 🎯 Vision

**Syncr keeps shared code consistent across every repository an organization owns, in a world where AI coding assistants make it cheaper than ever to generate a slightly different version of the same component in every repo that needs one.**

## 🧭 Mission

Ship a component once. Know everywhere it's used. See the moment it drifts. Fix it with a real, reviewable pull request — automatically.

## 🏭 The Industry Problem

Cursor, GitHub Copilot, ChatGPT, and Claude are extraordinary at generating and editing code *within a session, in front of a developer, in one repository at a time.* None of them maintain a standing, queryable registry of "every repository across an organization that copied this specific component, and which ones have since diverged." That's not a context-window limitation that better models will eventually close — it's a different kind of system: a persistent, cross-repo index that exists independently of any single coding session.

The mechanism that makes this worse, not better, as AI coding tools improve: **an AI pair programmer makes it cheap to regenerate a Button component slightly differently in every repo that needs one, fast — with no mechanism to know a canonical version already exists elsewhere in the org.** More AI-generated code, generated faster, across more repos, means more silent component drift accumulating in every organization that adopts these tools. That is a retrieval-and-governance gap, not a generation-quality gap, and it doesn't shrink as the underlying models get smarter.

**Who it serves (priority order):**
1. Software agencies managing 4–40 client repositories on overlapping design systems
2. Development studios maintaining a shared component library across products
3. Freelancers with a personal component library reused across client work
4. Enterprise engineering teams managing multiple internal products
5. Open-source maintainers with component libraries consumed by many downstream projects

**Honest counter-risk (tracked, not dismissed):** GitHub already has repository-scale access across every org on the platform and is actively extending Copilot Enterprise with governance-adjacent features (knowledge bases, custom instructions). This is not the same mechanism as component-version drift detection today, but a well-funded competitor building this natively starts with a distribution advantage Syncr doesn't have. This is the exact reason the roadmap's own NEXT-tier gate exists: validate the wedge with a real agency before assuming there's time to build a moat around it.

---

## 📍 Current Status

| Field | Value |
|-------|-------|
| Phase | GitHub Integration (Sprint 1 of the MVP Execution Plan) |
| Sprint | Sprint 1 — GitHub App Installation Flow |
| MVP definition | SYNCR-ROADMAP.md's 12-item NOW list — **not** a screen count |
| MVP target | ~20 weeks from Sprint 0 close, per the MVP Execution Plan (2-engineer, 2-week-sprint assumption — recheck if team size differs) |
| Overall progress | Auth + core DB schema done (roadmap items 1–2 of 12). Sprint 0 foundation fixes closed. GitHub App install flow (item 3) in progress. |

---

## ✅ Completed

| ID | Item | Type | Notes |
|----|------|------|-------|
| AUTH-DONE | Full custom auth service | Backend | Register/login/logout/refresh/MFA/password reset, device-level session revocation, tokenVersion-based force-logout. **Not Better Auth** — fully custom, built and hardened in-house (JWT revocation middleware, timing-safe login, device fingerprinting) |
| SCHEMA-DONE | Core DB schema | Database | ~40-table Drizzle schema (not Prisma) — identity/auth, RBAC, org→workspace→project→repository hierarchy, component registry, sync engine, scanning, audit |
| RBAC-DONE | RBAC foundation | Backend | roles/permissions/role_permissions/member_roles/member_resource_permissions, four system roles (OWNER/ADMIN/MEMBER/VIEWER), resource-level override escape hatch, platformRole flag for cross-org staff access |
| ORG-DONE | Organization + invite module | Backend | Personal org auto-created transactionally on registration, team org creation, invite-with-role flow, member removal with owner-orphan protection |
| APIKEY-DONE | API key / CLI PAT module | Backend | `sk_syncr_` / `syncr_live_` prefix+secret pattern, SHA-256 hashed, dashboard-only lifecycle management, CLI Bearer auth middleware |
| SPRINT0-DONE | Foundation fixes | Database | Duplicate `sync_status` enum removed, `repositories.role` → `repo_components.role` conflict resolved, environment-variables/secrets subsystem decision made and documented |

---

## 🔄 In Progress

| ID | Item | Type | Blocker |
|----|------|------|---------|
| GITHUB-001 | GitHub App installation flow (roadmap item #3) | Backend | None — active work. `provider_connections` table already exists; OAuth callback, installation lifecycle webhooks, and token refresh are the remaining work. |

---

## 📋 Planned (exact order — matches the MVP Execution Plan sprint sequence)

| Sprint | Item | Roadmap # | Depends on |
|--------|------|-----------|-----------|
| 1 (current) | GitHub App installation flow | #3 | Auth (done) |
| 2 | Webhook ingestion (idempotent by deliveryId) | #4 | Sprint 1 |
| 3 | Component registry CRUD (publish/version/tag) | #5 | Sprint 0 (repo_components fix) |
| 4 | CLI: login, publish, pull | #6 | Sprint 1 (CLI PAT infra already done), Sprint 3 |
| 5 | CLI: create, init | #7, #8 | Sprint 2, Sprint 4 |
| 6 | Detection algorithm (3-tier: filename → import-path → content-hash) | #9 | Sprint 3, Sprint 5 |
| 7 | Drift → SyncProposal generation | #10 | Sprint 6 |
| 8 | PR automation (real GitHub PRs, breaking-change quorum) | #11 | Sprint 7 |
| 9 | Minimal dashboard (repos + drift status, one table) | #12 | Sprint 7, Sprint 8 |
| 10 | Hardening + real-agency pilot feedback | — | Sprint 9 |

**Not planned yet, by design — do not start these:** CVE scanning, billing/Stripe, RBAC beyond basic org membership, audit log UI, outbound webhooks. These are SYNCR-ROADMAP.md's NEXT tier, gated on a real paying customer existing first.

---

## 🏗️ Architecture (corrected — this is what's actually running)

**Tenancy hierarchy:** `organizations → workspaces → projects → repositories`. **Not** a flat "Org is the tenant" model — this was a real factual error in the prior version of this file, not a simplification.

**Tech decisions actually in use** (see DECISION_LOG.md for the full corrected history):
- **Drizzle ORM**, not Prisma — direct SQL-shaped schema definitions, no Prisma Client generation step
- **Fully custom auth service**, not Better Auth — built in-house for full control over device-level revocation and tokenVersion-based force-logout, which is the mechanism `authMiddleware` depends on for real-time suspension enforcement
- **REST + Zod validation**, versioned under `/api/v1/` — unchanged from the original decision, not contradicted by anything found in review
- Package manager / build tooling (pnpm, Turborepo, Biome) — no contrary evidence found in the reviewed codebase; kept as-is unless a session finds otherwise

**RBAC shape:** roles are org-scoped (`organizationId` nullable for the four shared system roles), permissions are `resource:action` pairs, `member_roles` is a many-to-many join (a member can hold multiple roles), `member_resource_permissions` is the one resource-level override escape hatch. Platform staff (support/cross-org actions) use a separate `users.platformRole` flag, deliberately outside the org-scoped RBAC graph — see DECISION_LOG DEC-012.

---

## 📦 Backlog (NEXT / LATER — do not build now)

| Tier | Feature | Gated on |
|------|---------|----------|
| NEXT | CVE scanning (Scan, Vulnerability) | First differentiator (drift detection) validated with a real agency |
| NEXT | Billing/Stripe (Subscription) | Product proven worth paying for |
| NEXT | RBAC beyond basic org membership (custom roles) | A real customer actually needs it |
| NEXT | Audit log UI | Backend table exists; UI is a "nice," not a "needed" |
| NEXT | Outbound webhooks (customer Slack, etc.) | No customer has asked yet |
| LATER | Component marketplace | — |
| LATER | AI-assisted component generation | — |
| LATER | Self-hosted GitHub Enterprise Server support | — |
| LATER | SSO/SAML | — |
| LATER | EU data residency | — |
| LATER | Non-GitHub providers (GitLab/Bitbucket/Azure DevOps) | — |

---

_Rebuilt 2026-08-30 against src.zip (live schema) and SYNCR-ROADMAP.md. Previous version was dated 2025-06-26 and had drifted from the actual codebase — see HOW_TO_USE_THIS_SYSTEM.md._
