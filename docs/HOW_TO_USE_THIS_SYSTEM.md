# How To Use This System
> Read this first. This is how you never lose context again.

---

## What just happened, and why this file was rewritten

On 2026-08-30 this entire seven-document system was found to be ~14 months stale. It described Prisma where the codebase uses Drizzle, Better Auth where the codebase has a fully custom auth service, a flat Org-as-tenant model where the real schema has a four-level org→workspace→project→repository hierarchy, and a 134-screen MVP where the working roadmap defines MVP as 12 backend items and one dashboard table. None of that was caught until someone reviewed the actual `src.zip` against these files side by side.

**The system did not fail because it's a bad idea. It failed because nobody re-validated it against running code after the plan changed.** That's the one new rule this rewrite adds:

> **Any time SYNCR-ROADMAP.md changes, or a schema migration lands, re-check PROJECT_INDEX.md, FEATURE_REGISTRY.md, and DATABASE_INDEX.md against it in the same sitting — not "later."** A stale doc that looks authoritative is more dangerous than no doc, because people trust it without checking.

Everything below this point is otherwise the same discipline as before — it worked as a *process*; it just wasn't followed after the tech-stack decisions changed mid-project.

## The Problem This Solves

You are building a long-lived product, possibly solo or with a very small team. You will forget things. An AI assistant will lose context between sessions. Features will get duplicated. Architecture will drift. This system prevents all of that — **provided it is kept in sync with the actual code**, which is now a checked step, not an assumption.

## The System

Seven files. Each is a living document. Together they are the operating system for Syncr's project state.

```
docs/
  HOW_TO_USE_THIS_SYSTEM.md  ← you are here
  PROJECT_INDEX.md           ← master status, vision, and what to build next
  FEATURE_REGISTRY.md        ← every feature with full traceability to real schema/API
  SPRINT_TRACKER.md          ← current sprint + daily log
  DATABASE_INDEX.md          ← every real table and what uses it
  DECISION_LOG.md            ← every architectural decision and why
  SCREEN_REGISTRY.md         ← every UI screen, scoped to the actual MVP definition
```

Source of truth for anything these files might disagree with: **SYNCR-ROADMAP.md** (NOW/NEXT/LATER discipline) and the actual schema in the codebase. If a doc and the code disagree, the code wins, and the doc gets fixed in the same sitting — that rule is now explicit because its absence is exactly what caused the drift this rewrite is fixing.

---

## How Every AI Session Works

### To START a session:

```
Read docs/PROJECT_INDEX.md and tell me:
1. What sprint are we on?
2. What is currently in progress?
3. What is the next thing to build?
4. Any blockers?

Then cross-check: does PROJECT_INDEX.md's architecture section match
what's actually in the codebase (schema files, auth module)? If not,
flag the mismatch before we do anything else.

Then we will work on: [what you want to build today]
```

The added cross-check step is new — it's the direct fix for how this drift went undetected for over a year.

### To END a session:

```
Update the docs files to reflect what we built today.
Mark completed items as done.
Add the next planned items.
If any schema table, model name, or architectural decision changed
today, update DATABASE_INDEX.md and DECISION_LOG.md in this same pass —
not next session.
```

---

## Daily Workflow

```
Morning:
1. Open PROJECT_INDEX.md — read "In Progress" and "Next"
2. Start session with the standard prompt above (including the cross-check)
3. Work on the day's tasks

Evening:
1. Update SPRINT_TRACKER.md daily log row
2. Update PROJECT_INDEX.md
3. If schema or architecture changed today, update DATABASE_INDEX.md / DECISION_LOG.md now
4. git add docs/ && git commit -m "docs: update project state"
```

---

## When You Complete a Feature

1. Move it from "In Progress" to "Completed" in PROJECT_INDEX.md
2. Update FEATURE_REGISTRY.md — status to DONE, and confirm the model/API names listed still match the real schema
3. Update SPRINT_TRACKER.md
4. Update DATABASE_INDEX.md if a model was added or changed
5. Update SCREEN_REGISTRY.md if a new screen was built
6. Commit: `git commit -m "feat: [FEAT-XXX] feature name complete"`

## When You Make an Architectural Decision

1. Add a new entry to DECISION_LOG.md immediately — never edit a past entry's Decision field; add a new entry marked `SUPERSEDED BY` on the old one instead, so the history of *why things changed* survives (this is exactly the trail that was missing when Prisma silently became Drizzle with no logged decision)
2. Format: DEC-XXX, Date, Status, Context, Decision, Rationale, Alternatives, Consequences

## When You Are Confused About What To Build Next

Open PROJECT_INDEX.md → "Planned (exact order)". Build the next row. If that row's dependency isn't actually done in the real codebase (not just marked done in a doc), stop and fix the doc first.

---

## The Rule

**The docs are the source of truth, and the code is the source of truth for the docs.** Neither one alone is enough — a doc with no code is a plan; code with no doc is a project only one person can safely work on. Keeping both in sync, actively and on every session, is the actual job this system exists to do.

_Rewritten 2026-08-30, replacing a version that drifted ~14 months from the real codebase without anyone noticing._
