# Syncr — Sprint Tracker
> One sprint = 2 weeks. At 5-6 hours/day = 70-84 hours per sprint.
> Update this file at the END of every day and END of every sprint.

---

## Current Sprint

```
Sprint:     0 — Project Skeleton + Foundation
Started:    2025-06-26
Ends:       2025-07-10
Goal:       Monorepo running. packages/core complete. packages/database migrated.
Progress:   ▓░░░░░░░░░ 15%
```

### Sprint 0 Daily Log

| Day | Date | Built | Hours | Status |
|-----|------|-------|-------|--------|
| 1 | 2025-06-26 | Monorepo skeleton, tooling/ts, tooling/biome, dashboard init | 6h | ✅ Done |
| 2 | — | packages/core — all domain types | — | 🔄 Next |
| 3 | — | packages/core — schemas, errors, constants, events | — | ⏳ |
| 4 | — | packages/database — schema + migration | — | ⏳ |
| 5 | — | packages/database — all repository classes | — | ⏳ |
| 6 | — | packages/database — seed script + test | — | ⏳ |
| 7 | — | Buffer / catch-up | — | ⏳ |
| 8 | — | packages/config — env validation | — | ⏳ |
| 9 | — | packages/auth — Better Auth setup | — | ⏳ |
| 10 | — | packages/auth — RBAC middleware | — | ⏳ |
| 11 | — | Integration test: all packages work together | — | ⏳ |
| 12 | — | GitHub Actions CI (typecheck + test + build) | — | ⏳ |
| 13 | — | Sprint review + update all docs | — | ⏳ |
| 14 | — | Rest / sprint 1 planning | — | ⏳ |

### Sprint 0 Acceptance Criteria
- [ ] `pnpm typecheck` passes across all packages with zero errors
- [ ] `pnpm test` passes (even if tests are minimal)
- [ ] `pnpm build` completes for all packages
- [ ] All Prisma tables exist in Neon (verified in Prisma Studio)
- [ ] Seed script populates Role + Permission tables with all 25 permissions
- [ ] Import `@syncr/core` in `@syncr/database` works without error
- [ ] Import `@syncr/core` in `@syncr/auth` works without error
- [ ] GitHub Actions CI runs on every push

---

## Sprint 1 — API Foundation (planned)

```
Sprint:     1 — API Skeleton + Auth Routes
Starts:     2025-07-10 (after Sprint 0)
Goal:       apps/api deployed to Lambda. Auth routes working. First real API call.
```

**Tasks:**
1. apps/api — Hono app setup, health route, Lambda entry point
2. apps/api — deploy to AWS Lambda (manual, not CDK yet)
3. apps/api — auth routes: register, login, logout, /me
4. apps/api — org routes: create, read, update
5. apps/api — member routes: list, invite, remove
6. Postman collection for all routes
7. Integration tests for all routes

**Done when:** `curl https://[lambda-url]/health` returns 200. Full user registration flow works end to end.

---

## Sprint 2 — GitHub App (planned)

```
Goal: GitHub App installed, webhooks received, repos detected
```
- Register GitHub App on github.com
- packages/github — token manager, Octokit wrapper
- apps/github-app — webhook handler with HMAC verification
- Handle: installation.created, push events
- Initial component detection on install
- Done when: install on test org → see repos appear in dashboard

---

## Sprint 3 — Component Registry (planned)

```
Goal: syncr component push/pull works from terminal
```
- packages/storage — S3 upload/download
- apps/api — component registry routes
- apps/cli — login, push, pull, list commands
- npm publish @syncr/cli
- Done when: push a component from terminal, pull it in another project

---

## Sprint 4 — PR Automation (THE core feature) (planned)

```
Goal: Push a component → PRs appear in all consumer repos automatically
```
- apps/api — sync proposal routes
- packages/queue — SQS abstraction
- apps/worker — PR generator job
- apps/api — billing routes + Stripe
- Done when: push component → PRs open in consumer repos → approve from dashboard → merged

---

## Sprint 5 — Dashboard + CVE Scanner (planned)

```
Goal: First paying customer possible
```
- apps/dashboard — auth pages, repo page, sync PRs page, security page
- apps/worker — CVE scanner (OSV.dev)
- apps/api — vulnerability routes
- Email alerts via SES
- Done when: signup → install GitHub App → push component → see PR in dashboard → pay $49

---

## Sprint History

| Sprint | Goal | Status | Velocity |
|--------|------|--------|----------|
| Sprint 0 | Foundation | 🔄 In Progress | — |

---

## Velocity Tracking

_Will be populated after Sprint 0 completes._

---

_Last updated: 2025-06-26_
