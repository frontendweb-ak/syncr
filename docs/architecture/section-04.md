# SECTION 04 — Repository & Monorepo Architecture

**Version:** v2.0
**Status:** Architecture Freeze Candidate

---

# 4.1 Purpose

This chapter defines the canonical repository architecture for Syncr.

The repository structure is designed to:

- Scale from a single developer to multiple engineering teams.
- Promote modularity and clear ownership.
- Enable independent evolution of applications and shared libraries.
- Minimize coupling.
- Maximize code reuse.
- Simplify onboarding and maintenance.

The repository structure is considered a long-term architectural contract. Changes require an ADR.

---

# 4.2 Repository Principles

The repository follows these principles:

1. **Applications are deployable.**
2. **Packages are reusable.**
3. **Tooling is centralized.**
4. **Infrastructure is declarative.**
5. **Documentation is version-controlled.**
6. **No duplicated configuration.**
7. **Business logic never lives inside applications.**

---

# 4.3 Repository Structure

```text
syncr/
│
├── apps/
│
├── packages/
│
├── tooling/
│
├── infra/
│
├── docs/
│
├── scripts/
│
├── docker/
│
├── .github/
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── biome.json
└── README.md
```

---

# 4.4 Applications

Applications represent independently deployable runtimes.

Applications own:

- Runtime
- Environment variables
- Deployment
- Health checks
- Monitoring
- API endpoints
- UI

Applications do **NOT** own business logic.

Business logic belongs inside packages.

---

## apps/api

Purpose

Primary backend API.

Responsibilities

- REST API
- Authentication
- Authorization
- Validation
- API Documentation
- Rate limiting

Must not contain

- Database logic
- GitHub logic
- Registry logic

Instead:

Uses

```text
@syncr/database
@syncr/auth
@syncr/registry
@syncr/sync
```

---

## apps/dashboard

Purpose

Primary web application.

Responsibilities

- User Interface
- Administration
- Settings
- Analytics
- Organization Management

Must not contain business logic.

---

## apps/marketing

Purpose

Marketing website.

Responsibilities

- Landing pages
- Pricing
- Blog
- SEO

No business logic.

---

## apps/docs

Purpose

Documentation website.

Responsibilities

- Product Docs
- API Docs
- SDK Docs

---

## apps/github-app

Purpose

GitHub App runtime.

Responsibilities

- Receive webhooks
- Verify signatures
- Queue events

No synchronization logic.

---

## apps/worker

Purpose

Background processing.

Responsibilities

- Synchronization
- Notifications
- AI
- Scheduled jobs

Workers execute jobs.

They do not define business rules.

---

## apps/cli

Purpose

Developer CLI.

Responsibilities

- Bootstrap
- Login
- Sync
- Publish
- Validate

CLI consumes public APIs.

It never bypasses them.

---

# 4.5 Shared Packages

Packages contain reusable capabilities.

Packages have no deployment.

Packages expose public APIs.

---

## Platform Packages

```text
core

config

logger

events
```

---

### core

Shared types

Utilities

Errors

Constants

Validation

---

### config

Configuration loading.

Environment parsing.

Feature flags.

---

### logger

Structured logging.

Metrics.

Tracing.

---

### events

Domain event contracts.

Event dispatcher.

---

## Infrastructure Packages

```text
database

storage

queue

github
```

---

### database

Prisma

Repositories

Transactions

---

### storage

S3

R2

Future providers

---

### queue

Background queue abstraction.

---

### github

Octokit wrapper.

Webhook verification.

GitHub APIs.

---

## Domain Packages

```text
registry

sync

notifications

auth

ai
```

---

### registry

Software asset registry.

---

### sync

Synchronization engine.

---

### notifications

Email

Slack

Webhooks

Future providers

---

### auth

Authentication.

Authorization.

Organizations.

Permissions.

---

### ai

AI provider abstraction.

Prompt execution.

Embeddings.

Future agents.

---

## Presentation Packages

```text
sdk

ui
```

---

### sdk

Generated SDK.

---

### ui

Reusable React components.

---

# 4.6 Tooling

Tooling defines engineering standards.

```text
tooling/

typescript

biome

vitest

github

docker
```

Every project extends these configurations.

Configuration duplication is prohibited.

---

# 4.7 Infrastructure

```text
infra/

terraform

kubernetes

aws

monitoring
```

Infrastructure is code.

Manual cloud configuration is discouraged.

---

# 4.8 Documentation

```text
docs/

architecture

engineering

adr

api

operations

roadmap
```

Documentation evolves with code.

Features are not complete until documentation is updated.

---

# 4.9 Scripts

```text
scripts/

bootstrap

release

generate-sdk

cleanup

seed

migrations
```

Scripts automate engineering tasks.

Scripts should be idempotent where practical.

---

# 4.10 Dependency Rules

Applications

↓

Packages

↓

Core

Never the reverse.

```
apps
   ↓

domain packages
   ↓

platform packages
   ↓

core
```

Forbidden

```
core

↓

imports

↓

registry
```

Forbidden

```
database

↓

imports

↓

dashboard
```

Allowed

```
dashboard

↓

imports

↓

registry
```

---

# 4.11 Import Rules

Every package exposes only:

```typescript
index.ts;
```

Consumers never import internal files.

Forbidden

```typescript
import x from "@syncr/registry/src/service";
```

Allowed

```typescript
import { publish } from "@syncr/registry";
```

---

# 4.12 Ownership

Every package has:

- Owner
- Maintainer
- Public API
- Version
- ADR history

No orphan packages.

---

# 4.13 Future Evolution

Current

```
Modular Monolith
```

↓

Future

```
Extract Independent Services
```

Candidates

- AI
- Notifications
- Synchronization
- Search

Extraction occurs only when supported by measurable operational needs.

---

# 4.14 Repository Health

The repository continuously measures:

- Build duration
- Test duration
- Bundle size
- Dependency graph complexity
- Circular dependencies
- Dead code
- Type coverage
- Documentation coverage

These metrics support long-term maintainability.

---

# 4.15 Architecture Constraints

The following are prohibited:

- Business logic inside applications.
- Cross-package access to internal implementation.
- Circular dependencies.
- Environment variables outside the configuration package.
- Direct database access from UI applications.
- Copying code between packages instead of sharing it.

Violations require an ADR.

---

# 4.16 Architecture Decision

**Decision:** Adopt a modular monorepo with deployable applications and reusable packages.

**Alternatives Considered:**

- Multiple repositories
- Polyrepo with shared packages
- Monolithic application

**Why this approach:**

- Shared code reuse
- Consistent tooling
- Simplified dependency management
- Easier refactoring
- Unified CI/CD
- Single source of truth

**Trade-offs:**

- Larger repository size
- More complex build orchestration
- Requires strict dependency governance

The benefits outweigh the costs for Syncr's expected scale.
