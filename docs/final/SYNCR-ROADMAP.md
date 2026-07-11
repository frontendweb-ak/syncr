# Syncr — Build Tracker
Last updated: 2026-07-11

**The rule:** nothing moves from LATER to NOW without deleting something else from NOW, or admitting the timeline just moved. This file is the only place "should we build X" gets answered — if it's not written here, don't build it yet.

---

## NOW — MVP (the only thing you're allowed to work on)

Goal: one agency connects a repo, sees real drift, merges a real auto-generated PR.

| # | Feature | Status | Depends on |
|---|---|---|---|
| 1 | Auth (register/login/logout/refresh/MFA/password reset) | ✅ Done | — |
| 2 | Core DB schema (all Syncr tables) | ✅ Done | — |
| 3 | GitHub App installation flow (OAuth callback, store provider_connections, webhook endpoint) | 🔲 Not started — **build this next** | Auth |
| 4 | Webhook ingestion (GithubWebhookEvent storage + replay) | 🔲 Not started | #3 |
| 5 | Component registry CRUD (publish, versions, tags) | 🔲 Not started | #3 |
| 6 | CLI: `syncr login`, `syncr publish`, `syncr pull` | 🔲 Not started | #5 |
| 7 | CLI: `syncr create` (new project scaffold) | 🔲 Not started | #6 |
| 8 | CLI: `syncr init` (brownfield onboarding) | 🔲 Not started | #6 |
| 9 | Detection algorithm (3-tier: import-path / hash / file-name) | ✅ Designed, not implemented | #5, #4 |
| 10 | Drift → SyncProposal generation | 🔲 Not started | #9 |
| 11 | PR automation (open real GitHub PR from proposal) | 🔲 Not started | #10 |
| 12 | Minimal dashboard (connected repos + drift status, one table) | 🔲 Not started | #10 |

**Everything else below this line does not exist yet as far as your code is concerned. That's correct. Don't open those files.**

---

## NEXT — Post-MVP (only after #1–12 above are live and a real agency has used them)

| Feature | Why it waits |
|---|---|
| CVE scanning (Scan, Vulnerability) | Second differentiator — validate the first one sells before building the second |
| Billing/Stripe (Subscription) | Don't build payment plumbing before you know the product is worth paying for |
| Team/RBAC beyond basic org membership | Already have a working RBAC foundation — extend only when a real customer needs custom roles |
| Audit log UI | Backend table exists; UI is a "nice" not a "needed" |
| Webhook endpoints (outbound, to customer Slack etc.) | No customer has asked for this yet |

---

## LATER — Deferred (in the BRD on purpose, don't re-litigate)

- Component marketplace
- AI-assisted component generation
- Self-hosted GitHub Enterprise Server support
- SSO/SAML
- EU data residency
- Non-GitHub providers (GitLab/Bitbucket/Azure DevOps)

---

## Reference docs (don't rebuild these, read them when stuck)

- `Syncr-BRD.docx` — use cases, personas, edge case catalog
- `Syncr-Technical-Design.docx` — CLI architecture, memory/config system
- `syncr-schema-additions.ts` — full DB schema
- `detection.service.ts` — drift detection algorithm
- `auth-additions/` — auth module (routes, controller, service, MFA, password reset)

## This week's single task

Build #3 (GitHub App installation flow). Nothing else on the NOW list can be tested without it. Don't start #5 or #9 in parallel — one thing at a time is the actual discipline this file exists to enforce.
