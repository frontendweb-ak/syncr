# Syncr — Decision Log
> Every architectural decision, why it was made, and what alternatives were rejected.
> Never revisit a decision without adding a new entry here explaining why.
> **2026-08-30 correction pass:** three entries below (DEC-004, DEC-006, DEC-008) described decisions that do not match the real codebase. Per the "never edit history" rule, they are marked SUPERSEDED rather than deleted, with new corrected entries added — see DEC-013, DEC-014, DEC-015.

---

## Format
```
### DEC-XXX: Decision title
Date: YYYY-MM-DD
Status: ACCEPTED | SUPERSEDED | REJECTED
Context / Decision / Rationale / Alternatives considered / Consequences / Superseded by
```

---

### DEC-001: pnpm over npm for workspaces
**Date:** 2025-06-26 | **Status:** ACCEPTED (no contrary evidence found in review)

### DEC-002: Turborepo over Nx for build orchestration
**Date:** 2025-06-26 | **Status:** ACCEPTED (no contrary evidence found in review)

### DEC-003: Hono.js over Express for the API
**Date:** 2025-06-26 | **Status:** ACCEPTED — confirmed still in use (route files reviewed use Hono's `new Hono<AppContext>()` pattern throughout)

### DEC-004: Better Auth over Clerk for authentication
**Date:** 2025-06-26 | **Status:** SUPERSEDED by DEC-013
**Note:** the real codebase does not use Better Auth. A fully custom auth service was built instead. This entry is kept for history — the reasoning against Clerk (vendor lock-in) may still be valid context for why *a* custom or self-hosted approach was chosen, even though Better Auth specifically was not what got built.

### DEC-005: REST over GraphQL for the API
**Date:** 2025-06-26 | **Status:** ACCEPTED — confirmed, all routes reviewed are REST under `/api/v1/`

### DEC-006: Neon Postgres over AWS RDS
**Date:** 2025-06-26 | **Status:** ACCEPTED (schema uses `drizzle-orm/pg-core`, consistent with any Postgres host including Neon — no contrary evidence, but also not independently re-confirmed during this review; verify against actual deployment config)

### DEC-007: Biome over ESLint + Prettier
**Date:** 2025-06-26 | **Status:** ACCEPTED (no contrary evidence found in review)

### DEC-008: Org is the tenant (no separate Tenant model)
**Date:** 2025-06-26 | **Status:** SUPERSEDED by DEC-015
**Note:** this was factually wrong against the real schema even at face value — the real tenancy hierarchy is four levels deep (`organizations → workspaces → projects → repositories`), not flat. Kept for history.

### DEC-009: AuditLog uses BigInt autoincrement PK
**Date:** 2025-06-26 | **Status:** ACCEPTED — confirmed correct against the real `audit_logs` schema (bigserial PK, for strict insertion-order guarantees a UUID cannot provide)

### DEC-010: ComponentVersion is immutable after creation
**Date:** 2025-06-26 | **Status:** ACCEPTED — confirmed correct against the real `component_versions` schema (no `updatedAt` column, content-hash deduped)

### DEC-011: RBAC via resource:action Permission model
**Date:** 2025-06-26 | **Status:** ACCEPTED — confirmed correct against the real `permissions` schema, with one refinement: `permissions.name` was originally a manually-written duplicate of `resource`+`action` (drift risk); during review this was changed to a **generated column** so the two representations can never disagree. See DEC-016.

---

## Decisions made during the actual build (not in the original log — added now for the trail HOW_TO_USE_THIS_SYSTEM.md requires)

### DEC-012: Platform-staff access via a flat `users.platformRole` flag, not a second RBAC graph
**Date:** 2026-08 (during RBAC review) | **Status:** ACCEPTED
**Context:** Syncr's own support/operations staff need to act across organizations (support tickets, impersonation, abuse handling) — but `roles`/`permissions`/`member_roles` are deliberately org-scoped by design.
**Decision:** A nullable `platformRole` enum (`SUPPORT` | `SUPER_ADMIN`) directly on `users`, checked in middleware, entirely outside the org-scoped RBAC graph.
**Rationale:** Stretching the org-scoped RBAC tables to also mean "sees everything everywhere" would be the wrong tool — that graph exists to model authorization for potentially thousands of orgs; platform staff is a handful of people and doesn't need the same machinery. This is the same sizing judgment as rejecting ABAC/ReBAC for customer-facing RBAC: match the tool to the actual scale of the problem.
**Alternatives considered:** A synthetic "platform" pseudo-organization every staff member belongs to (rejected — every authorization check would need to special-case it); a second permissions table scoped globally (rejected — duplicate machinery for a handful of users).

### DEC-013: Fully custom auth service, not Better Auth
**Date:** 2026-08 (confirmed during codebase review) | **Status:** ACCEPTED
**Supersedes:** DEC-004
**Context:** The real codebase has a complete, custom-built `AuthService`/`DeviceService`/`CredentialService`/`MfaService` stack — not the Better Auth integration DEC-004 originally specified.
**Rationale (reconstructed from what the code actually does):** device-level session revocation with independent `tokenVersion` counters on both `users` (global "log out everywhere") and `devices` (single-device revocation) is a fairly specific mechanism that third-party auth libraries don't typically expose at this granularity. Building it in-house gives `authMiddleware` the ability to reject an already-issued, signature-valid JWT in real time the moment a device is revoked or a user is suspended — the core requirement behind BR-4/NFR-2.
**Alternatives considered:** Better Auth (originally chosen, not what got built), Clerk (rejected in DEC-004, still rejected), NextAuth/Auth.js, custom (what was actually built).
**Consequences:** Full ownership of session security — also full responsibility for it. The auth module has been through at least one real bug-fix pass already (hardcoded JWT role claims, a device-revocation IDOR, a non-transactional registration flow) — treat it as actively maintained code, not a solved problem.

### DEC-014: Passkeys table exists, flow deliberately not built
**Date:** 2026-08 | **Status:** ACCEPTED
**Context:** A `passkeys` (WebAuthn) table and a `PasskeyRepo`/`PasskeyService` exist in the codebase, fully functional in isolation, but no route or controller wires them up.
**Decision:** Leave the table and repo/service as-is. Do not build the registration/authentication ceremony flow. Do not delete the code.
**Rationale:** Explicitly called a "strike" during scope review — agencies don't need WebAuthn to pay for Syncr, and CLI auth is solved by the simpler API-key flow (DEC-017 equivalent). Deleting working, harmless code for a feature that might be wanted later costs more than leaving it dormant.
**Consequences:** Any future session must not assume "table exists" means "feature works" — this is the one deliberate exception to that assumption in the schema.

### DEC-015: Real tenancy hierarchy is four levels, not flat
**Date:** 2026-08 (confirmed during codebase review) | **Status:** ACCEPTED
**Supersedes:** DEC-008
**Context:** DEC-008 claimed "Org is the tenant, no separate Tenant model." The real schema has `organizations → workspaces → projects → repositories`.
**Rationale (reconstructed):** an agency managing many client repos needs a grouping level between "the whole agency" and "one repo" — workspaces plausibly map to clients or teams, projects to individual engagements. This wasn't a documented rationale anywhere found during review, which is itself the problem this rewrite exists to fix — the decision was made in code without ever being logged.
**Consequences:** every authorization check that assumed org-level scoping alone is insufficient — `workspace_access` is a real, separate gate (see the RBAC resolution algorithm: workspace access is checked *before* role-based permissions, not derived from them).

### DEC-016: `permissions.name` is a generated column, not a manually-written duplicate
**Date:** 2026-08 (during RBAC review) | **Status:** ACCEPTED
**Context:** `permissions.name` (e.g. `"syncr:repository:read"`) was originally written by hand alongside `resource`+`action` columns, with nothing enforcing agreement between them.
**Decision:** Changed to `generatedAlwaysAs(sql\`'syncr:' || resource || ':' || action\`)`.
**Rationale:** A generated column makes drift structurally impossible instead of a code-review discipline that can be forgotten. This is a general pattern worth reapplying: anywhere a column is a pure function of other columns on the same row, prefer a generated column over trusting every write path to keep it in sync by hand.

### DEC-017: Partial unique indexes for "exactly one X per Y" invariants, not composite uniques
**Date:** 2026-08 (during RBAC review) | **Status:** ACCEPTED
**Context:** Two real bugs found in the same shape: `organizations_personal_owner_unique` on `(ownerUserId, isPersonal)` and `workspace_default_unique` on `(organizationId, isDefault)` were both composite unique indexes that Postgres uniques as *whole tuples* — meaning "at most one `true` row" was never actually enforced; a third row of any kind collided with one of the first two.
**Decision:** Both replaced with partial unique indexes (`UNIQUE (ownerUserId) WHERE isPersonal = true`, etc).
**Rationale:** This is the correct general pattern for "at most one row where some flag is true, among an otherwise unconstrained set" — a composite unique index is the wrong tool for that invariant even though it looks superficially similar.
**Consequences:** Any future "exactly one default/primary/active X per Y" column should use this pattern from the start, not the composite-unique pattern that caused these two bugs.

---

### DEC-018: Next.js App Router + shadcn/ui + TanStack Query + Zustand for the dashboard frontend
**Date:** 2026-08-31 | **Status:** ACCEPTED
**Context:** No frontend framework decision had ever been logged here, despite one already existing in an earlier (AppInit-branded) planning pass. Ratifying it now, with one correction.
**Decision:** Next.js 15 App Router, Server Components by default (dashboard pages should have zero client components at the top level unless they need interactivity), shadcn/ui for the component library, TanStack Query for server state, Zustand for UI-only state (checkboxes, modal state — deliberately kept separate from server state so the two systems never fight over what owns a value).
**Rationale:** Matches existing React knowledge. shadcn/ui gives owned, modifiable components rather than an opaque dependency — consistent with the CLI's own template philosophy (Technical Design §2.2). Server Components minimize client bundle size for data-heavy pages (repo list, drift status) which is exactly what the dashboard mostly is.
**Correction from the source document:** the original review specified Clerk for auth. The real codebase has a fully custom auth service (DEC-013) — the frontend talks to that, not a third-party auth provider. Nothing else in this decision changes.
**Alternatives considered:** Vue (rejected — smaller ecosystem for this app shape, and every other decision here already assumes React; re-deriving Vue equivalents is pure switching cost with no offsetting benefit).

### DEC-019: Product renamed AppInit → Syncr
**Date:** 2025 (originally decided) / 2026-08-31 (confirmed and reconciled against all docs) | **Status:** ACCEPTED
**Context:** "AppInit" implied project scaffolding — a tool deliberately not being built. A brand review correctly diagnosed this and proposed alternatives (Syncline, Driftless, among others).
**Decision:** Syncr.
**Consequences:** All prior AppInit-branded planning documents (10-year blueprint, architecture blueprint, dev roadmap, expert reviews) are superseded in branding only — their structural content (release sequencing logic, architecture review findings, frontend guidance) was reconciled into the current doc set where still accurate, per the Syncr 5-Year Vision & Strategic Plan document.

---

_Corrected 2026-08-30. Superseded entries are kept, not deleted, per this file's own stated discipline — the point of a decision log is the trail, including the mistakes._
