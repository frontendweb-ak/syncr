# Syncr — Project Index
> **This file is the source of truth for everything Syncr.**
> Update this file whenever a feature is completed, a decision is made, or architecture changes.
> Every AI session starts by reading this file. Every AI session ends by updating it.

## 🎯 What Syncr Is

**Syncr** is the Agency Portfolio Operating System — a platform that keeps shared components synchronized across every client repository an agency manages, monitors CVEs across the entire portfolio, and enforces code standards automatically.

**The problem:** Agencies build 10–40 client projects using overlapping code. When a shared component changes, someone manually opens PRs in every repo. Nobody automates this. Syncr does.

**One-line pitch:** Ship a component once. Update everywhere.

**Who it serves (priority order):**
1. Software agencies managing 4–40 client repos
2. Development studios with shared design systems
3. Freelancers with personal component libraries
4. Enterprise engineering teams managing multiple products
5. Open source maintainers

---

## 📍 Current Status

| Field | Value |
|-------|-------|
| Phase | Foundation Setup |
| Sprint | Sprint 0 — Project Skeleton |
| Started | 2025-06-26 |
| MVP Target | Sprint 6 (~12 weeks) |
| Overall Progress | 2% |

---

## ✅ Completed

| ID | Item | Type | Date |
|----|------|------|------|
| SETUP-001 | Monorepo skeleton (pnpm + Turborepo) | Infra | 2025-06-26 |
| SETUP-002 | tooling/typescript configs (base, node, nextjs) | Infra | 2025-06-26 |
| SETUP-003 | tooling/biome config | Infra | 2025-06-26 |
| SETUP-004 | apps/dashboard Next.js init | App | 2025-06-26 |
| DOC-001 | Master BRD + Investor Pitch document | Docs | 2025-06-26 |
| DOC-002 | Sprint-by-sprint dev roadmap | Docs | 2025-06-26 |
| DOC-003 | 10 Expert Reviews document | Docs | 2025-06-26 |
| DOC-004 | API + Database master document | Docs | 2025-06-26 |
| DB-DESIGN-001 | Prisma schema designed (20 models, 15 enums) | Database | 2025-06-26 |

---

## 🔄 In Progress

| ID | Item | Type | Blocker |
|----|------|------|---------|
| PKG-001 | packages/core — types, schemas, errors, constants | Package | None — START HERE |
| PKG-002 | packages/database — Prisma schema + repositories | Package | PKG-001 must finish first |

---

## 📋 Planned (exact order — do not skip)

| Order | ID | Item | Depends On |
|-------|----|------|-----------|
| 3 | PKG-003 | packages/config — Zod env validation | PKG-001 |
| 4 | PKG-004 | packages/auth — Better Auth + RBAC middleware | PKG-001, PKG-002 |
| 5 | APP-001 | apps/api — Hono skeleton, health route, Lambda | PKG-001,002,003,004 |
| 6 | APP-002 | apps/api — Auth routes (register, login, logout) | APP-001 |
| 7 | APP-003 | apps/api — Org CRUD routes | APP-002 |
| 8 | APP-004 | apps/api — Member + Invitation routes | APP-003 |
| 9 | APP-005 | apps/github-app — webhook handler | PKG-001,002,003 |
| 10 | PKG-005 | packages/github — Octokit wrapper | PKG-001, PKG-003 |
| 11 | APP-006 | apps/api — Repo routes | APP-003, APP-005 |
| 12 | PKG-006 | packages/storage — S3 abstraction | PKG-001, PKG-003 |
| 13 | APP-007 | apps/api — Component registry routes | APP-006, PKG-006 |
| 14 | CLI-001 | apps/cli — login command | APP-002 |
| 15 | CLI-002 | apps/cli — component push/pull/list | APP-007, CLI-001 |
| 16 | APP-008 | apps/api — Sync proposal routes | APP-007 |
| 17 | PKG-007 | packages/queue — SQS abstraction | PKG-001, PKG-003 |
| 18 | WORKER-001 | apps/worker — PR generator job | APP-008, PKG-005, PKG-007 |
| 19 | APP-009 | apps/api — CVE/Security routes | APP-006 |
| 20 | WORKER-002 | apps/worker — CVE scanner job | APP-009, PKG-007 |
| 21 | APP-010 | apps/api — Stripe billing routes | APP-003 |
| 22 | APP-011 | apps/api — ApiToken routes | APP-003 |
| 23 | INFRA-001 | CI/CD GitHub Actions | APP-001 |
| 24 | INFRA-002 | AWS Lambda deployment | APP-001, APP-005 |
| 25 | DASH-001 | apps/dashboard — auth pages | APP-002 |
| 26 | DASH-002 | apps/dashboard — repos page | APP-006 |
| 27 | DASH-003 | apps/dashboard — registry page | APP-007 |
| 28 | DASH-004 | apps/dashboard — sync PRs page | APP-008 |
| 29 | DASH-005 | apps/dashboard — security page | APP-009 |
| 30 | DASH-006 | apps/dashboard — settings | APP-010, APP-011 |

---

## 🏗️ Architecture

**Package dependency rule:** packages/core ← packages/database ← packages/auth ← apps/api ← everything else

**Tech decisions (final — do not revisit):**
- pnpm workspaces + Turborepo (migrate to Nx at 10+ engineers)
- Hono.js on AWS Lambda (not Express — cold start performance)
- Neon Postgres + Prisma 6
- Better Auth (not Clerk — more control, no vendor lock-in)
- Biome (not ESLint + Prettier — one tool, faster)
- Next.js 15 App Router for dashboard

---

## 📦 Backlog (future — do not build now)

| ID | Feature | Target Sprint |
|----|---------|--------------|
| AI-001 | AI Setup Assistant | Sprint 8 |
| AI-002 | AI Component Generator | Sprint 9 |
| SDK-001 | packages/sdk auto-generated | Sprint 7 |
| NOTIFY-001 | packages/notifications | Sprint 5 |
| MKTPLACE-001 | Component marketplace | Sprint 10+ |
| ENT-001 | SSO/SAML | Sprint 14 |
| COMP-001 | SOC2 compliance reports | Sprint 12 |

---

_Last updated: 2025-06-26 | Session: Foundation setup_
