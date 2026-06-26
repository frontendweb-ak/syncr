# TypeScript Configuration

## Purpose

Shared TypeScript configuration for the entire Syncr monorepo.

## Files

### base.json

Common compiler options shared across all applications and packages.

### node.json

Used by:

- API
- CLI
- Workers
- Scripts

### react.json

Used by:

- React packages

### nextjs.json

Used by:

- Dashboard
- Marketing
- Docs

## Rules

- Never duplicate compiler options.
- All projects extend one of these configs.
- Changes require an Architecture Decision Record (ADR).
