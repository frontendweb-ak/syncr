# How To Use This System
> Read this first. This is how you never lose context again.

---

## The Problem This Solves

You are building a 10-year product alone. You will forget things. I (Claude) will lose context between sessions. Features will get duplicated. Architecture will drift. This system prevents all of that.

## The System

Seven files in your repo. Each is a living document. Together they are the complete operating system for Syncr.

```
docs/
  HOW_TO_USE_THIS_SYSTEM.md  ← you are here
  PROJECT_INDEX.md           ← master status + what to build next
  FEATURE_REGISTRY.md        ← every feature with full traceability
  SPRINT_TRACKER.md          ← current sprint + daily log
  DATABASE_INDEX.md          ← every model and what uses it
  DECISION_LOG.md            ← every architectural decision and why
  SCREEN_REGISTRY.md         ← every UI screen with API requirements
```

---

## How Every AI Session Works

### To START a session with me (Claude):

Paste this EXACT message at the beginning:

```
Read docs/PROJECT_INDEX.md and tell me:
1. What sprint are we on?
2. What is currently in progress?
3. What is the next thing to build?
4. Any blockers?

Then we will work on: [what you want to build today]
```

That message forces me to read the source of truth before suggesting anything. I cannot give you wrong context because the context is in the file, not in my memory.

### To END a session with me:

Before closing, say:

```
Update the docs files to reflect what we built today.
Mark completed items as done.
Add the next planned items.
```

I will update PROJECT_INDEX.md, SPRINT_TRACKER.md, and any other relevant files. Commit those changes. The next session picks up exactly where this one left off.

---

## Daily Workflow

```
Morning:
1. Open PROJECT_INDEX.md — read "In Progress" and "Next"
2. Start Claude session with the standard prompt above
3. Work on the day's tasks

Evening:
1. Update SPRINT_TRACKER.md daily log row
2. Ask Claude to update PROJECT_INDEX.md
3. git add docs/ && git commit -m "docs: update project state"
```

---

## When You Complete a Feature

1. Move it from "In Progress" to "Completed" in PROJECT_INDEX.md
2. Update FEATURE_REGISTRY.md — change status to DONE
3. Update SPRINT_TRACKER.md — mark the day's task done
4. Update DATABASE_INDEX.md if a model was added/changed
5. Update SCREEN_REGISTRY.md if a new screen was built
6. Commit: `git commit -m "feat: [FEAT-XXX] feature name complete"`

---

## When You Make an Architectural Decision

1. Add a new entry to DECISION_LOG.md immediately
2. Never revisit a decision without explaining why in a new entry
3. Format: DEC-XXX, Date, Status, Context, Decision, Rationale, Alternatives, Consequences

---

## When You Are Confused About What To Build Next

Open PROJECT_INDEX.md. Look at "Planned (exact order)". Build the next row. Never skip rows.

If you want to understand why something is in the order it is, look at the "Depends On" column. If A depends on B, build B first. Always.

---

## How To Tell Me (Claude) To Review What's Done

```
Review FEAT-[XXX] — I just completed [feature name].
Tell me:
1. What edge cases did I miss?
2. What tests are missing?
3. What security concerns exist?
4. What does this enable that I should build next?
```

---

## The Rule

**The docs are the source of truth. Not memory. Not chat history. The files.**

If it's not in the docs, it doesn't officially exist in the project.
If you built it, document it.
If you decided it, log it.
If you completed it, mark it.

That is how a solo developer builds a 10-year product without going insane.

---

_This system was designed for Syncr on 2025-06-26._
_It works for any AI assistant: Claude, ChatGPT, Gemini — the files are the brain, not the AI._
