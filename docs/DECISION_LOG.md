# Syncr — Decision Log
> Every architectural decision, why it was made, and what alternatives were rejected.
> Never revisit a decision without adding a new entry here explaining why.

---

## Format
```
### DEC-XXX: Decision title
Date: YYYY-MM-DD
Status: ACCEPTED | SUPERSEDED | REJECTED
Context: Why did we need to make this decision?
Decision: What did we decide?
Rationale: Why this option over the alternatives?
Alternatives considered: What else was on the table?
Consequences: What does this decision commit us to?
Superseded by: (if applicable)
```

---

### DEC-001: pnpm over npm for workspaces
**Date:** 2025-06-26 | **Status:** ACCEPTED
**Context:** Choosing a package manager for the monorepo.
**Decision:** pnpm with pnpm-workspace.yaml
**Rationale:** npm workspaces hoist node_modules, creating phantom dependencies that work locally but fail in Lambda's strict node_modules isolation. pnpm's strict isolation prevents this class of bug permanently.
**Alternatives:** npm workspaces (rejected — phantom deps), Yarn Berry (rejected — complex PnP mode)
**Consequences:** All developers must have pnpm installed. `corepack enable` required on every machine.

---

### DEC-002: Turborepo over Nx for build orchestration
**Date:** 2025-06-26 | **Status:** ACCEPTED
**Context:** Choosing a monorepo build tool.
**Decision:** Turborepo for MVP, with documented migration path to Nx at 10+ engineers.
**Rationale:** Turborepo is 15 lines of config. Nx is 200+. For a solo developer this cognitive overhead is a tax. Nx's boundary enforcement is genuinely valuable at team scale — not before.
**Alternatives:** Nx (deferred), Lerna (deprecated), Rush (too complex)
**Migration trigger:** 10+ engineers OR 15+ packages, whichever comes first.

---

### DEC-003: Hono.js over Express for the API
**Date:** 2025-06-26 | **Status:** ACCEPTED
**Context:** Choosing an HTTP framework for the API Lambda.
**Decision:** Hono.js 4.x
**Rationale:** Hono runs natively on AWS Lambda with zero adapter overhead. Express has cold start overhead on Lambda. Hono's API is Express-compatible — middleware, routing, context all feel the same. Learning time: 1 day.
**Alternatives:** Express (rejected — Lambda cold start overhead), Fastify (rejected — Lambda adapter complexity)

---

### DEC-004: Better Auth over Clerk for authentication
**Date:** 2025-06-26 | **Status:** ACCEPTED
**Context:** Choosing an auth provider.
**Decision:** Better Auth (self-hosted, TypeScript-native)
**Rationale:** Clerk is excellent but creates vendor lock-in: org management, roles, and invitations are all encoded in Clerk's data model. Migration away from Clerk is a 4-week project. Better Auth gives us the same features (sessions, OAuth, org management) with full data ownership.
**Alternatives:** Clerk (rejected — vendor lock-in risk), NextAuth/Auth.js (rejected — no org management), custom auth (rejected — too slow to build)
**Consequences:** We own the auth data. We are responsible for security of session tokens. This is non-trivial.

---

### DEC-005: REST over GraphQL for the API
**Date:** 2025-06-26 | **Status:** ACCEPTED
**Context:** Choosing API style.
**Decision:** REST with Zod validation, versioned under /v1/
**Rationale:** Syncr's resources are well-defined and simple. GraphQL adds resolver complexity with zero benefit for this use case. REST is faster to build, easier to test, easier for the CLI to call with plain fetch, and generates OpenAPI specs for future SDK auto-generation.
**Alternatives:** GraphQL (rejected — unnecessary complexity for well-defined resources), tRPC (rejected — too coupled to TypeScript-only clients)

---

### DEC-006: Neon Postgres over AWS RDS
**Date:** 2025-06-26 | **Status:** ACCEPTED
**Context:** Choosing database hosting.
**Decision:** Neon.tech serverless Postgres
**Rationale:** Neon provides branch-per-PR environments (critical for testing), scales to zero when idle, HTTP-compatible driver works with Cloudflare Workers and Lambda without connection pooling, and has a generous free tier. Same wire protocol as RDS — migration is possible if needed.
**Alternatives:** AWS RDS (rejected — no branching, minimum cost even idle), PlanetScale (rejected — no Postgres, no foreign keys), Supabase (rejected — too much added complexity)

---

### DEC-007: Biome over ESLint + Prettier
**Date:** 2025-06-26 | **Status:** ACCEPTED
**Context:** Choosing lint and formatting tools.
**Decision:** Biome 1.x for both linting and formatting.
**Rationale:** One tool, one config, 10x faster than ESLint + Prettier. For a solo developer the maintenance overhead of two tools with plugin conflicts is not worth it. The tradeoff: Biome has fewer rules than ESLint. Acceptable for MVP.
**Alternatives:** ESLint + Prettier (rejected — two tools, slow, complex config)
**Revisit trigger:** If a critical ESLint rule (accessibility, React hooks) is missing in Biome, add ESLint for that specific package only.

---

### DEC-008: Org is the tenant (no separate Tenant model)
**Date:** 2025-06-26 | **Status:** ACCEPTED
**Context:** Multi-tenancy design.
**Decision:** Org model IS the tenant. No separate Tenant table.
**Rationale:** Syncr is B2B where the organisation IS the tenant. A separate Tenant table adds joins with zero benefit. Org.plan, Org.status, Org.featureFlags own all tenant-level state.
**Alternatives:** Separate Tenant model (rejected — unnecessary indirection for this domain)

---

### DEC-009: AuditLog uses BigInt autoincrement PK
**Date:** 2025-06-26 | **Status:** ACCEPTED
**Context:** Choosing the primary key for the audit log table.
**Decision:** BigInt autoincrement (not cuid/uuid)
**Rationale:** UUIDs cannot be ordered by insertion time reliably. AuditLog rows must be strictly ordered — event 10042 ALWAYS happened before 10043. BigInt autoincrement guarantees this. Required for SOC2 audit trail integrity.
**Alternatives:** cuid (rejected — no strict ordering), uuid (rejected — no strict ordering), timestamp (rejected — collisions under load)

---

### DEC-010: ComponentVersion is immutable after creation
**Date:** 2025-06-26 | **Status:** ACCEPTED
**Context:** Registry versioning strategy.
**Decision:** ComponentVersion rows have no updatedAt. Once published, a version cannot be modified.
**Rationale:** This matches npm's model and is correct. If a version is wrong, publish a new one. Mutable versions would allow silent breaking changes that consumers have already pulled.
**Alternatives:** Mutable versions (rejected — breaks consumer trust, allows silent breaking changes)

---

### DEC-011: RBAC via resource:action Permission model (from TGAC)
**Date:** 2025-06-26 | **Status:** ACCEPTED
**Context:** Choosing RBAC implementation.
**Decision:** Role + Permission + RolePermission tables with "resource:action" naming convention, taken from the TGAC project pattern.
**Rationale:** This is a battle-tested pattern. The resource:action format ("component:publish", "sync:approve") is self-documenting and maps directly to API route permission checks. Roles aggregate permissions. Direct user permissions allow one-off grants.
**From:** TGAC project Permission model — identical pattern adapted to Syncr domain.

---

_Last updated: 2025-06-26 | 11 decisions recorded_
