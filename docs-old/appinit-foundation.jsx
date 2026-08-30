import { useState } from "react";

// ── DATA ─────────────────────────────────────────────────────────────────────

const GAPS = [
  {
    area: "CLI Engineering",
    you: "You know Node.js, npm, scripting",
    gap: "You've likely never built a published CLI package",
    delta: "Small",
    deltaColor: "#00E5A0",
    toLearn: [
      { item: "commander or CAC", time: "4h", why: "Parses commands, flags, args" },
      { item: "handlebars or EJS", time: "3h", why: "Variable injection into template files" },
      { item: "execa", time: "2h", why: "Run npm install, git init from Node" },
      { item: "npm publish workflow", time: "3h", why: "Scoped packages, versioning, npm org" },
      { item: "bin field in package.json", time: "1h", why: "What makes npx appinit work" },
    ],
  },
  {
    area: "Monorepo Architecture",
    you: "You've likely worked in single repos",
    gap: "Managing 5+ packages that depend on each other cleanly",
    delta: "Medium",
    deltaColor: "#FBBF24",
    toLearn: [
      { item: "npm workspaces", time: "4h", why: "Links packages locally, shared node_modules" },
      { item: "Turborepo", time: "6h", why: "Runs build/test/lint across packages in parallel with caching" },
      { item: "Changesets", time: "3h", why: "Version bumping and changelog across multiple packages" },
      { item: "tsconfig path aliases", time: "2h", why: "import from @appinit/core without relative paths" },
    ],
  },
  {
    area: "File System & Code Generation",
    you: "You use the filesystem but rarely generate code programmatically",
    gap: "Building a reliable, cross-OS code generator",
    delta: "Small",
    deltaColor: "#00E5A0",
    toLearn: [
      { item: "fs-extra", time: "2h", why: "Better fs — copy, move, ensureDir" },
      { item: "glob", time: "2h", why: "Find files matching patterns in template dirs" },
      { item: "Path normalization", time: "2h", why: "Windows uses \\ — your code must handle both" },
      { item: "Handlebars helpers", time: "3h", why: "Conditional blocks, loops in templates ({{#if auth}})" },
    ],
  },
  {
    area: "Object Storage",
    you: "You know Postgres well — row-based data",
    gap: "Storing binary files (component source, template zips) at scale",
    delta: "Small",
    deltaColor: "#00E5A0",
    toLearn: [
      { item: "Cloudflare R2 SDK", time: "4h", why: "S3-compatible, cheap. Push/pull component files" },
      { item: "Presigned URLs", time: "3h", why: "Secure direct uploads from CLI without routing through your API" },
      { item: "Content-addressable storage", time: "3h", why: "Store by hash so duplicate uploads cost nothing" },
    ],
  },
  {
    area: "Background Jobs",
    you: "You know synchronous request/response APIs",
    gap: "AI scans, CVE checks, PR generation — none of these finish in 200ms",
    delta: "Medium",
    deltaColor: "#FBBF24",
    toLearn: [
      { item: "Trigger.dev", time: "6h", why: "Background jobs, retries, cron — built for TypeScript. Simplest option." },
      { item: "Job queue patterns", time: "4h", why: "Idempotency, retries, dead letter queues" },
      { item: "Webhooks (inbound)", time: "4h", why: "GitHub sends you webhooks when PRs merge — you need to receive + verify them" },
    ],
  },
  {
    area: "GitHub App / OAuth App",
    you: "You've used GitHub but not built integrations",
    gap: "AppInit needs to open PRs, read repos, install on orgs",
    delta: "Medium",
    deltaColor: "#FBBF24",
    toLearn: [
      { item: "GitHub App creation", time: "4h", why: "vs OAuth App — Apps act as themselves, not users" },
      { item: "Octokit SDK", time: "4h", why: "Official GitHub API client for Node.js" },
      { item: "GitHub App auth flow", time: "6h", why: "Installation tokens, JWT signing — non-trivial but learnable" },
      { item: "Webhook verification", time: "2h", why: "Verify GitHub's HMAC signature before processing" },
    ],
  },
  {
    area: "AI / LLM Integration",
    you: "You know APIs — this is just another API call",
    gap: "Structured outputs, prompt engineering, streaming, cost control",
    delta: "Small",
    deltaColor: "#00E5A0",
    toLearn: [
      { item: "Anthropic SDK", time: "4h", why: "Claude API for text generation, structured JSON output" },
      { item: "Tool use / structured output", time: "6h", why: "Get JSON back reliably — critical for config generation" },
      { item: "Streaming responses", time: "3h", why: "Stream AI output to terminal for good UX" },
      { item: "Prompt engineering", time: "1 week ongoing", why: "The quality of prompts determines feature quality" },
      { item: "Token counting + cost estimation", time: "3h", why: "Prevent runaway costs per user" },
    ],
  },
  {
    area: "Payments & Marketplace",
    you: "You may have used Stripe for basic charges",
    gap: "Subscriptions with tiers, usage-based billing, and marketplace payouts",
    delta: "Medium",
    deltaColor: "#FBBF24",
    toLearn: [
      { item: "Stripe Subscriptions", time: "1 day", why: "Products, prices, checkout, portal" },
      { item: "Stripe webhooks", time: "4h", why: "subscription.updated, payment_failed — your billing logic lives here" },
      { item: "Stripe Connect (later)", time: "2 days", why: "Needed for marketplace seller payouts — save for Year 3" },
      { item: "Usage-based billing", time: "1 day", why: "Metered billing for AI credits" },
    ],
  },
];

const ARCH = {
  root: "appinit/",
  desc: "The monorepo root. Everything lives here.",
  children: [
    {
      name: "packages/",
      desc: "All publishable npm packages. Each is independent but can import from siblings.",
      children: [
        {
          name: "cli/",
          desc: "The @appinit/cli package. The thing users install with npm i -g @appinit/cli or npx.",
          stable: true,
          children: [
            { name: "src/", children: [
              { name: "commands/", desc: "One file per command: new.ts, component.ts, login.ts, deploy.ts", stable: true },
              { name: "generators/", desc: "Core file generation logic. Takes a template config, outputs files.", stable: true },
              { name: "prompts/", desc: "All interactive prompt definitions. Separates UX from logic.", stable: true },
              { name: "utils/", desc: "Shared CLI utilities: logger, spinner, error formatter", stable: true },
              { name: "index.ts", desc: "Entry point. Sets up commander, registers all commands.", stable: true },
            ]},
            { name: "templates/", desc: "All scaffold templates live here as plain files with {{variables}}.", stable: true },
            { name: "package.json", desc: "bin field points to dist/index.js — what makes npx appinit work" },
          ],
        },
        {
          name: "core/",
          desc: "The @appinit/core package. Shared types, schemas, utilities used by CLI, API, and UI. Never has side effects.",
          stable: true,
          children: [
            { name: "src/", children: [
              { name: "types/", desc: "All TypeScript interfaces: Project, Template, Component, User, Org", stable: true },
              { name: "schemas/", desc: "Zod schemas for .appinit.json config, API request bodies, template manifests", stable: true },
              { name: "constants/", desc: "Shared constants: template names, error codes, API endpoints", stable: true },
              { name: "utils/", desc: "Pure functions shared everywhere: slugify, validateSemver, etc.", stable: true },
            ]},
          ],
        },
        {
          name: "api/",
          desc: "The @appinit/api package. Your Hono.js backend. Handles auth, registry, billing, webhooks.",
          stable: true,
          children: [
            { name: "src/", children: [
              { name: "routes/", desc: "One file per domain: auth.ts, projects.ts, components.ts, billing.ts, ai.ts", stable: true },
              { name: "middleware/", desc: "Auth verification, rate limiting, request logging, error handling", stable: true },
              { name: "services/", desc: "Business logic layer. Routes call services; services call DB/storage/external APIs.", stable: true },
              { name: "db/", desc: "Prisma client instance, migrations, seed scripts", stable: true },
              { name: "jobs/", desc: "Trigger.dev background jobs: cve-scan.ts, sync-proposer.ts, pr-generator.ts", stable: false, note: "Added in v3.0" },
              { name: "integrations/", desc: "One file per external service: github.ts, stripe.ts, anthropic.ts, resend.ts", stable: true },
              { name: "index.ts", desc: "Hono app setup, mounts all route groups, exports fetch handler for CF Workers" },
            ]},
            { name: "prisma/", desc: "schema.prisma and migration files. Single source of truth for DB shape.", stable: true },
          ],
        },
        {
          name: "ui/",
          desc: "The @appinit/ui package. Your Next.js App Router dashboard.",
          stable: true,
          children: [
            { name: "app/", children: [
              { name: "(auth)/", desc: "Login, signup pages — handled by Clerk", stable: true },
              { name: "(dashboard)/", desc: "All authenticated pages: projects, registry, billing, settings", stable: true },
              { name: "api/", desc: "Next.js API routes for thin proxying/webhooks only. Real logic is in @appinit/api", stable: true },
            ]},
            { name: "components/", children: [
              { name: "ui/", desc: "shadcn/ui generated components — buttons, dialogs, tables etc.", stable: true },
              { name: "features/", desc: "Domain components: ProjectCard, ComponentPreview, RegistryBrowser", stable: true },
              { name: "layouts/", desc: "Sidebar, topbar, page wrappers", stable: true },
            ]},
            { name: "lib/", desc: "API client (typed fetch wrapper), auth helpers, hooks", stable: true },
          ],
        },
        {
          name: "registry/",
          desc: "The @appinit/registry package. Storage and retrieval logic for components and templates.",
          stable: false,
          note: "Introduced in v1.2.0",
          children: [
            { name: "src/", children: [
              { name: "storage.ts", desc: "Cloudflare R2 client — push/pull component files", stable: true },
              { name: "versioning.ts", desc: "Semver logic, immutable release enforcement", stable: true },
              { name: "metadata.ts", desc: "Postgres queries for component/template metadata", stable: true },
              { name: "sync.ts", desc: "Diff computation between local and registry versions", stable: false, note: "v3.1+" },
            ]},
          ],
        },
        {
          name: "ai/",
          desc: "The @appinit/ai package. All AI logic isolated here — easy to swap models later.",
          stable: false,
          note: "Introduced in v1.3.0",
          children: [
            { name: "src/", children: [
              { name: "prompts/", desc: "All system and user prompts as versioned TypeScript constants. Never inline prompts.", stable: true },
              { name: "generators/", desc: "config-generator.ts, component-generator.ts, doc-generator.ts", stable: true },
              { name: "tools/", desc: "Claude tool_use definitions for structured output", stable: true },
              { name: "client.ts", desc: "Anthropic SDK wrapper with retry logic, cost tracking, streaming helpers", stable: true },
            ]},
          ],
        },
        {
          name: "sdk/",
          desc: "The @appinit/sdk package. Auto-generated TypeScript client for the API. Consumers use this — not raw fetch.",
          stable: false,
          note: "Generated from OpenAPI spec. Added after API stabilizes in v2.0",
          children: [
            { name: "src/", desc: "Generated from openapi.yaml using openapi-typescript. Never hand-edited.", stable: true },
          ],
        },
      ],
    },
    {
      name: "apps/",
      desc: "Non-publishable applications. These run but aren't npm packages.",
      children: [
        {
          name: "docs/",
          desc: "Documentation site. Nextra (Next.js-based). Deployed to Vercel.",
          stable: true,
        },
        {
          name: "web/",
          desc: "Marketing site. Next.js. Landing page, pricing, blog. Separate from dashboard.",
          stable: true,
        },
      ],
    },
    {
      name: "infra/",
      desc: "Infrastructure as code. Not TypeScript — Terraform or Pulumi configs.",
      stable: false,
      note: "Added when you need repeatable infra (v2.0+)",
      children: [
        { name: "cloudflare/", desc: "Workers, R2 buckets, DNS config" },
        { name: "neon/", desc: "Postgres branch config" },
        { name: "vercel/", desc: "Project config, env var templates" },
      ],
    },
    {
      name: "tooling/",
      desc: "Shared dev tooling configs used by every package. Defined once, inherited everywhere.",
      stable: true,
      children: [
        { name: "eslint/", desc: "Base ESLint config. All packages extend this." },
        { name: "typescript/", desc: "Base tsconfig.json files: base.json, node.json, nextjs.json" },
        { name: "vitest/", desc: "Shared vitest config" },
      ],
    },
    {
      name: "turbo.json",
      desc: "Turborepo pipeline config. Defines build/test/lint order and caching rules.",
      stable: true,
    },
    {
      name: "package.json",
      desc: "Root package.json with workspaces definition. npm install here installs everything.",
      stable: true,
    },
    {
      name: ".github/",
      desc: "CI/CD workflows. PR checks, release automation, template validation.",
      stable: true,
    },
  ],
};

const PRINCIPLES = [
  {
    title: "Packages, not folders",
    icon: "◈",
    color: "#00E5A0",
    rule: "Every major domain (cli, api, ui, registry, ai) is a separate npm package with its own package.json. They communicate via imports, not function calls or shared globals.",
    why: "When you add @appinit/plugins in Year 6, you create a new package. You never touch the others. If you'd used a giant src/modules/ folder, Year 6 would require touching everything.",
    antiPattern: "Never do: src/cli/, src/api/, src/ui/ all in one package. You'll regret this by v1.2.",
  },
  {
    title: "Core is the contract",
    icon: "◆",
    color: "#818CF8",
    rule: "@appinit/core contains ONLY types, schemas, and pure utility functions. Zero external dependencies. Zero side effects. Every other package imports from core, never the reverse.",
    why: "Core is your shared language. If cli and api both need a 'Project' type, it lives in core — not in cli and copied to api. When you change the Project type, you change it once.",
    antiPattern: "Never import from @appinit/cli inside @appinit/api. Dependencies must always point inward toward core, never sideways.",
  },
  {
    title: "Services, not routes",
    icon: "◎",
    color: "#F97316",
    rule: "API routes are thin — they validate input (Zod), call a service, return the result. All business logic lives in services/. A route file should rarely exceed 30 lines.",
    why: "When background jobs need to run the same logic as an API route, they import the service directly. You never duplicate logic or call your own API from a background job.",
    antiPattern: "Never write database queries directly in route handlers. When your CVE scanner needs the same component lookup as your API, you'll thank yourself.",
  },
  {
    title: "The API owns the DB",
    icon: "◷",
    color: "#FBBF24",
    rule: "Only @appinit/api touches Prisma and Postgres. The CLI and UI never query the database directly — they call the API. The CLI uses @appinit/sdk to make type-safe API calls.",
    why: "This sounds obvious but it's easy to break. If you let the CLI import Prisma, you've coupled your CLI to your database. CLI users would need DB credentials. That's insane at scale.",
    antiPattern: "Never: import { prisma } from '@appinit/api/db' in your CLI code. The CLI talks to the API over HTTPS, full stop.",
  },
  {
    title: "Isolate AI completely",
    icon: "◐",
    color: "#34D399",
    rule: "All AI calls go through @appinit/ai. No other package imports the Anthropic SDK directly. The ai package exports named functions: generateConfig(), generateComponent(), generateDocs().",
    why: "Today you use Claude. In 3 years there's a better model. You change one file in @appinit/ai. No other package knows or cares. Also: all prompts are versioned strings in /prompts/ — never inline.",
    antiPattern: "Never: import Anthropic from 'anthropic' in your API route files. All AI flows through the ai package's public interface.",
  },
  {
    title: "Jobs are not routes",
    icon: "◑",
    color: "#F472B6",
    rule: "Background jobs (CVE scanning, sync proposer, PR generation) live in api/src/jobs/ and import from services/. They're triggered by Trigger.dev events, not HTTP requests.",
    why: "A CVE scan across 200 projects might take 10 minutes. You can't do that in an API route (timeout in 30s). Jobs are the right primitive. Services make them reuse the same business logic.",
    antiPattern: "Never spawn long-running work from an API route. The route enqueues a job and returns immediately. The job does the work.",
  },
  {
    title: "Feature flags from day one",
    icon: "⬡",
    color: "#A78BFA",
    rule: "Every new feature is gated behind a feature flag checked against the user's subscription tier. The flag lives in @appinit/core/src/features.ts as a simple lookup.",
    why: "When you add AI features in v1.3 but they're paid-only, you don't rearchitect your auth. You check the flag. Free users see a paywall. Enterprise users see the feature. One line of code.",
    antiPattern: "Never hardcode tier checks scattered across your codebase. One feature flags file. All checks in one place.",
  },
];

const WHEN = [
  {
    q: "Am I ready to start now?",
    a: "Yes. You know Node, React, and Postgres. That covers 80% of what v0.1 through v1.1 needs. The gaps (CLI packaging, monorepo setup, Turborepo) are small — an afternoon each. You are overqualified for the first 4 months of work.",
    color: "#00E5A0",
  },
  {
    q: "What's the actual risk?",
    a: "Not technical. The risk is building too much before validating. The v0.1 CLI is 3 weeks of work. If nobody uses it, you've lost 3 weeks. If 100 people use it, you've validated the core idea and every subsequent week compounds. Start immediately, ship fast.",
    color: "#F97316",
  },
  {
    q: "What should I learn THIS WEEK before writing code?",
    a: "One thing: how to create and publish an npm CLI package. Read: 'Building a Node.js CLI tool' + the bin field in package.json + npm publish --access public. That's it. Everything else you learn when you hit the wall.",
    color: "#818CF8",
  },
  {
    q: "When do I need to learn Turborepo and monorepos?",
    a: "Day 1. Set up the monorepo first. If you start with a single repo and bolt on the monorepo at v1.2, you're rewriting file paths, imports, and configs across everything. One hour of monorepo setup on Day 1 saves a week of pain later.",
    color: "#FBBF24",
  },
  {
    q: "What if I've never published to npm before?",
    a: "This is your first task, not the CLI itself. Create a toy package called 'hello-world-cli', publish it, run npx hello-world-cli, see it work. That exercise — create package.json with bin field, add a TypeScript entry point, compile, publish — takes 2 hours and removes all fear.",
    color: "#34D399",
  },
];

const DB_SCHEMA = `-- THE CORE POSTGRES SCHEMA
-- Everything AppInit ever needs starts here
-- Add columns, new tables — never rewrite these core tables

-- Organizations (agencies, companies, solo devs)
CREATE TABLE orgs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,    -- appinit.dev/org/[slug]
  name        TEXT NOT NULL,
  plan        TEXT NOT NULL DEFAULT 'free', -- free|pro|agency|enterprise
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Users (belong to orgs via memberships)
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id    TEXT UNIQUE NOT NULL,    -- Clerk manages passwords/OAuth
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Org membership + roles
CREATE TABLE org_members (
  org_id  UUID REFERENCES orgs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role    TEXT NOT NULL DEFAULT 'member', -- owner|admin|member|viewer
  PRIMARY KEY (org_id, user_id)
);

-- Projects (scaffolded apps tracked in AppInit)
CREATE TABLE projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID REFERENCES orgs(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL,
  template_id  TEXT NOT NULL,        -- e.g. "next-tailwind-ts"
  template_ver TEXT NOT NULL,        -- e.g. "2.1.0"
  repo_url     TEXT,                 -- GitHub repo if connected
  meta         JSONB DEFAULT '{}',   -- extensible: any extra data
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, slug)
);

-- Components (in private registry)
CREATE TABLE components (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID REFERENCES orgs(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  framework   TEXT NOT NULL,         -- react|vue|svelte
  latest_ver  TEXT NOT NULL DEFAULT '1.0.0',
  is_public   BOOLEAN DEFAULT false,
  meta        JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, slug)
);

-- Component versions (immutable once published)
CREATE TABLE component_versions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id  UUID REFERENCES components(id) ON DELETE CASCADE,
  version       TEXT NOT NULL,
  storage_key   TEXT NOT NULL,       -- R2 object key
  changelog     TEXT,
  published_by  UUID REFERENCES users(id),
  published_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(component_id, version)
);

-- Templates (available scaffolds)
CREATE TABLE templates (
  id          TEXT PRIMARY KEY,       -- "next-tailwind-ts"
  name        TEXT NOT NULL,
  description TEXT,
  framework   TEXT NOT NULL,
  version     TEXT NOT NULL,
  is_official BOOLEAN DEFAULT false,
  is_public   BOOLEAN DEFAULT true,
  author_id   UUID REFERENCES users(id),
  meta        JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions (linked to Stripe)
CREATE TABLE subscriptions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id               UUID UNIQUE REFERENCES orgs(id) ON DELETE CASCADE,
  stripe_customer_id   TEXT UNIQUE,
  stripe_sub_id        TEXT UNIQUE,
  plan                 TEXT NOT NULL DEFAULT 'free',
  status               TEXT NOT NULL DEFAULT 'active',
  current_period_end   TIMESTAMPTZ,
  updated_at           TIMESTAMPTZ DEFAULT now()
);

-- Audit log (append-only, forever)
CREATE TABLE audit_log (
  id         BIGSERIAL PRIMARY KEY,
  org_id     UUID REFERENCES orgs(id),
  user_id    UUID REFERENCES users(id),
  action     TEXT NOT NULL,           -- "component.pushed", "project.created"
  resource   TEXT,                    -- resource type
  resource_id TEXT,                   -- resource id
  meta       JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);`;

const IMMEDIATE_STEPS = [
  {
    step: 1,
    action: "Publish a toy CLI to npm",
    time: "Today (2–3 hours)",
    detail: "Not AppInit. A dummy CLI called 'my-first-cli' that just prints 'Hello World'. Goal: learn the bin field, npm publish, npx flow. Remove all unfamiliarity before real work.",
    cmd: "mkdir my-cli && cd my-cli && npm init -y\nnpm install typescript commander\n# Add bin: { \"my-cli\": \"dist/index.js\" } to package.json\n# Write src/index.ts, compile, npm publish --access public\nnpx my-cli  # see it work",
  },
  {
    step: 2,
    action: "Set up the AppInit monorepo skeleton",
    time: "Day 2 (3–4 hours)",
    detail: "Create the folder structure exactly as architected. Empty packages, correct package.json files, workspaces wired, Turborepo installed. This is the foundation that never gets rewritten.",
    cmd: "mkdir appinit && cd appinit\nnpm init -y\n# Add workspaces: [\"packages/*\", \"apps/*\"] to root package.json\nmkdir -p packages/{cli,core,api,ui}\nnpx create-turbo@latest --skip-install\n# Wire tsconfigs, eslint configs in tooling/",
  },
  {
    step: 3,
    action: "Build @appinit/core first (types only)",
    time: "Day 3 (2–3 hours)",
    detail: "Before writing any CLI or API code, define your core types in @appinit/core. Project, Template, Component, User, Org. These are your contracts. Getting them right now means you never break interfaces between packages later.",
    cmd: "cd packages/core\n# Define in src/types/index.ts:\n# interface Project, Template, Component, Org, User\n# Define Zod schemas for each\n# Export everything from src/index.ts\n# This package has zero dependencies except zod",
  },
  {
    step: 4,
    action: "Build the file generator in @appinit/cli",
    time: "Day 4–5 (1 day)",
    detail: "The pure function: takes a template name and destination path, copies files, replaces {{variables}}. No CLI yet — just the generator logic with tests. Testable in isolation.",
    cmd: "# packages/cli/src/generators/scaffold.ts\n# function scaffold(template: string, dest: string, vars: Record<string,string>)\n# Uses fs-extra + handlebars\n# Test: scaffold('next-app', '/tmp/test', { name: 'myapp' })\n# Assert: /tmp/test/package.json contains 'myapp'",
  },
  {
    step: 5,
    action: "Wire the CLI entry point",
    time: "Day 6 (half day)",
    detail: "Connect commander to your scaffold generator. One command: appinit new [name]. No prompts yet — hardcode the template. Get it end to end working: npx ts-node src/index.ts new my-app opens a browser.",
    cmd: "# packages/cli/src/index.ts\nimport { program } from 'commander'\nimport { scaffold } from './generators/scaffold'\nprogram\n  .command('new <name>')\n  .action((name) => scaffold('next-app', `./${name}`, { name }))\nprogram.parse()",
  },
  {
    step: 6,
    action: "Add your first real template",
    time: "Day 7–9 (2 days)",
    detail: "Build the next-tailwind-ts template as a real folder of files with {{variables}}. This is the actual product. Every file a developer would get. Make it genuinely production-ready: ESLint, Prettier, tsconfig, Tailwind, App Router, vercel.json.",
    cmd: "# packages/cli/templates/next-tailwind-ts/\n# package.json with {{name}}, {{description}}\n# app/page.tsx, app/layout.tsx\n# tailwind.config.ts, tsconfig.json\n# .eslintrc.json, .prettierrc\n# .github/workflows/ci.yml\n# vercel.json, README.md",
  },
  {
    step: 7,
    action: "Push to GitHub + set up CI",
    time: "Day 10 (half day)",
    detail: "GitHub repo. GitHub Actions workflow that runs: typecheck, lint, test, and a scaffold smoke test (scaffold a project, run npm install, run npm run build — must pass). This CI runs on every PR forever.",
    cmd: "# .github/workflows/ci.yml\n# jobs: typecheck, lint, test, scaffold-smoke-test\n# scaffold-smoke-test: runs your CLI against tmp dir\n# asserts npm run build exits 0",
  },
  {
    step: 8,
    action: "npm publish v0.1.0",
    time: "Day 10",
    detail: "Publish to npm. Test from a clean machine with npx @appinit/cli new my-app. Share the GitHub link anywhere. Get feedback. This is your proof of concept. Everything else builds on this working moment.",
    cmd: "cd packages/cli\nnpm version 0.1.0\nnpm publish --access public\n# From any machine:\nnpx @appinit/cli new my-app",
  },
];

// ── COMPONENTS ──────────────────────────────────────────────────────────────

function FileTree({ node, depth = 0 }) {
  const [open, setOpen] = useState(depth < 2);
  const isDir = node.children !== undefined;
  const indent = depth * 16;

  return (
    <div>
      <div
        onClick={() => isDir && setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "flex-start", gap: 8,
          padding: "4px 0 4px",
          paddingLeft: indent,
          cursor: isDir ? "pointer" : "default",
          borderLeft: depth > 0 ? "1px solid #0E1520" : "none",
          marginLeft: depth > 0 ? indent - 16 : 0,
        }}
      >
        <span style={{ color: "#1E2A3A", fontSize: 11, marginTop: 2, flexShrink: 0, width: 12 }}>
          {isDir ? (open ? "▼" : "▶") : "·"}
        </span>
        <div style={{ flex: 1 }}>
          <span style={{
            fontSize: 12,
            color: isDir
              ? (node.stable === false ? "#FBBF2490" : "#818CF8")
              : (node.stable === false ? "#FBBF2470" : "#4A6080"),
            fontWeight: isDir ? 500 : 400,
          }}>
            {node.name || node}
          </span>
          {node.stable === false && node.note && (
            <span style={{ fontSize: 9, color: "#FBBF2460", marginLeft: 8, letterSpacing: "0.08em" }}>
              {node.note}
            </span>
          )}
          {node.desc && (
            <div style={{ fontSize: 11, color: "#2A3848", lineHeight: 1.5, marginTop: 1 }}>{node.desc}</div>
          )}
        </div>
      </div>
      {isDir && open && node.children && (
        <div>
          {node.children.map((child, i) => (
            <FileTree key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AppInitFoundation() {
  const [tab, setTab] = useState("start");

  const tabs = [
    { id: "start", label: "Start Now" },
    { id: "gaps", label: "Your Gaps" },
    { id: "arch", label: "Architecture" },
    { id: "db", label: "Database Schema" },
    { id: "principles", label: "Design Principles" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060810",
      color: "#C8D4E0",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 13,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&family=Fraunces:wght@300;400;600;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #141C28; }
        .tab-btn { transition: all 0.15s; cursor: pointer; border: none; background: none; font-family: inherit; }
        .hover-row:hover { background: rgba(255,255,255,0.02); }
        @keyframes fadein { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
        .fadein { animation: fadein 0.2s ease forwards; }
        .gap-card:hover { border-color: #1E2A3C !important; }
        pre { white-space: pre-wrap; word-break: break-all; }
      `}</style>

      {/* HEADER */}
      <div style={{ padding: "40px 28px 28px", borderBottom: "1px solid #0C1018", background: "#060810" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ fontSize: 10, color: "#1E2A3A", letterSpacing: "0.2em", marginBottom: 12, textTransform: "uppercase" }}>
            AppInit · Foundation Blueprint · Full-Stack Edition
          </div>
          <h1 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: "clamp(28px, 4vw, 56px)",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: "#E8EDF8",
            marginBottom: 12,
          }}>
            You're ready.<br />
            <span style={{ color: "#00E5A0" }}>Start today.</span>
          </h1>
          <p style={{ color: "#2E3C50", fontSize: 12, maxWidth: 480, lineHeight: 1.8 }}>
            You already know everything you need for the first 4 months. Here's what gaps exist, the exact architecture that never needs rewriting, and your first 8 steps.
          </p>
        </div>
      </div>

      {/* TABS */}
      <div style={{ borderBottom: "1px solid #0C1018", padding: "0 28px", position: "sticky", top: 0, zIndex: 100, background: "#060810" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", overflowX: "auto" }}>
          {tabs.map(t => (
            <button key={t.id} className="tab-btn"
              onClick={() => setTab(t.id)}
              style={{
                padding: "13px 16px", fontSize: 10, letterSpacing: "0.12em",
                textTransform: "uppercase", whiteSpace: "nowrap",
                color: tab === t.id ? "#00E5A0" : "#243040",
                borderBottom: tab === t.id ? "2px solid #00E5A0" : "2px solid transparent",
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px" }}>

        {/* ── START NOW ─────────────────────────────────── */}
        {tab === "start" && (
          <div className="fadein">
            {/* When questions */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 10, color: "#1E2A3A", letterSpacing: "0.18em", marginBottom: 16, textTransform: "uppercase" }}>
                Questions you're asking
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {WHEN.map((w, i) => (
                  <div key={i} style={{
                    background: "#0A0E18",
                    border: `1px solid #0E1520`,
                    borderLeft: `3px solid ${w.color}`,
                    borderRadius: 8, padding: "16px 18px",
                  }}>
                    <div style={{ fontSize: 13, color: "#A0B0C0", fontWeight: 500, marginBottom: 8 }}>{w.q}</div>
                    <div style={{ fontSize: 12, color: "#3A5060", lineHeight: 1.75 }}>{w.a}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Immediate steps */}
            <div>
              <div style={{ fontSize: 10, color: "#1E2A3A", letterSpacing: "0.18em", marginBottom: 16, textTransform: "uppercase" }}>
                Your first 8 steps — in order — starting today
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {IMMEDIATE_STEPS.map((s, i) => (
                  <div key={i} style={{
                    background: "#0A0E18", border: "1px solid #0E1520",
                    borderRadius: 10, overflow: "hidden",
                  }}>
                    <div style={{ display: "grid", gridTemplateColumns: "52px 1fr", }}>
                      <div style={{
                        background: "#07090F",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        padding: "16px 0",
                        borderRight: "1px solid #0E1520",
                      }}>
                        <span style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 900, color: "#00E5A020" }}>{s.step}</span>
                      </div>
                      <div style={{ padding: "16px 18px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                          <div style={{ fontSize: 13, color: "#B8C8D8", fontWeight: 500 }}>{s.action}</div>
                          <span style={{ fontSize: 10, color: "#00E5A070", letterSpacing: "0.08em", background: "#00E5A010", border: "1px solid #00E5A020", padding: "2px 8px", borderRadius: 4 }}>
                            {s.time}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "#2E4050", lineHeight: 1.7, marginBottom: 12 }}>{s.detail}</div>
                        <pre style={{
                          background: "#06080E",
                          border: "1px solid #0C1018",
                          borderRadius: 6,
                          padding: "12px 14px",
                          fontSize: 11,
                          color: "#2A4838",
                          lineHeight: 1.8,
                          overflow: "auto",
                        }}>{s.cmd}</pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── GAPS TAB ──────────────────────────────────── */}
        {tab === "gaps" && (
          <div className="fadein">
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: "#E0E8F0", marginBottom: 6 }}>
                You know 80%. Here's the 20%.
              </h2>
              <p style={{ color: "#2E3C50", fontSize: 12, lineHeight: 1.7 }}>
                As a Node + React + Postgres developer, most of AppInit is in your wheelhouse. These are the specific gaps — and they're smaller than you think.
              </p>
            </div>

            {/* Delta legend */}
            <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
              {[["Small gap", "#00E5A0", "Hours to learn. Don't overthink it."],
                ["Medium gap", "#FBBF24", "A few days. Learn when you hit it."],
              ].map(([label, c, note]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: "inline-block" }} />
                  <span style={{ fontSize: 11, color: "#2E3C50" }}><span style={{ color: c }}>{label}</span> — {note}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {GAPS.map((g, i) => (
                <div key={i} className="gap-card" style={{
                  background: "#0A0E18", border: "1px solid #0E1520",
                  borderRadius: 10, overflow: "hidden",
                }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid #0C1018", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 14, color: "#B0C0D0", fontWeight: 500, marginBottom: 4 }}>{g.area}</div>
                      <div style={{ fontSize: 11, color: "#2A3848", marginBottom: 2 }}>You: {g.you}</div>
                      <div style={{ fontSize: 11, color: "#3A4858" }}>Gap: {g.gap}</div>
                    </div>
                    <span style={{
                      fontSize: 10, padding: "3px 10px", borderRadius: 20,
                      background: `${g.deltaColor}15`, border: `1px solid ${g.deltaColor}30`,
                      color: g.deltaColor, letterSpacing: "0.08em", flexShrink: 0,
                    }}>{g.delta} gap</span>
                  </div>
                  <div style={{ padding: "12px 20px" }}>
                    <div style={{ fontSize: 10, color: "#1E2A3A", letterSpacing: "0.12em", marginBottom: 10, textTransform: "uppercase" }}>What to learn</div>
                    {g.toLearn.map((item, j) => (
                      <div key={j} className="hover-row" style={{
                        display: "grid", gridTemplateColumns: "160px 50px 1fr",
                        padding: "6px 8px", gap: 12, borderRadius: 4,
                        borderBottom: j < g.toLearn.length - 1 ? "1px solid #08101A" : "none",
                      }}>
                        <span style={{ fontSize: 12, color: "#6080A0" }}>{item.item}</span>
                        <span style={{ fontSize: 10, color: g.deltaColor, letterSpacing: "0.05em" }}>{item.time}</span>
                        <span style={{ fontSize: 11, color: "#2A3A4A", lineHeight: 1.5 }}>{item.why}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ARCHITECTURE TAB ──────────────────────────── */}
        {tab === "arch" && (
          <div className="fadein">
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: "#E0E8F0", marginBottom: 6 }}>
                The architecture that never gets rewritten
              </h2>
              <p style={{ color: "#2E3C50", fontSize: 12, lineHeight: 1.7, marginBottom: 12 }}>
                Set this up on Day 1. <span style={{ color: "#FBBF24" }}>Yellow items</span> don't exist yet — they appear in future versions. But the folder <em>shape</em> is set from the start. Click folders to expand.
              </p>
              <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#2E3C50", flexWrap: "wrap" }}>
                <span><span style={{ color: "#818CF8" }}>■</span> Exists at v0.1</span>
                <span><span style={{ color: "#FBBF2490" }}>■</span> Added in future version (create folder, leave empty)</span>
              </div>
            </div>
            <div style={{
              background: "#08090F", border: "1px solid #0E1520",
              borderRadius: 10, padding: "20px",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              <FileTree node={ARCH} depth={0} />
            </div>

            {/* Dependency direction diagram */}
            <div style={{ marginTop: 20, background: "#0A0E18", border: "1px solid #0E1520", borderRadius: 10, padding: "20px 22px" }}>
              <div style={{ fontSize: 10, color: "#1E2A3A", letterSpacing: "0.15em", marginBottom: 16, textTransform: "uppercase" }}>Package dependency rules — these never change</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { from: "@appinit/cli", to: "@appinit/core, @appinit/sdk", arrow: "→", note: "CLI imports types from core, calls API via SDK" },
                  { from: "@appinit/ui", to: "@appinit/core, @appinit/sdk", arrow: "→", note: "Dashboard imports types from core, calls API via SDK" },
                  { from: "@appinit/api", to: "@appinit/core, @appinit/registry, @appinit/ai", arrow: "→", note: "API owns all business logic" },
                  { from: "@appinit/registry", to: "@appinit/core", arrow: "→", note: "Registry only knows core types" },
                  { from: "@appinit/ai", to: "@appinit/core", arrow: "→", note: "AI layer only depends on core types" },
                  { from: "@appinit/core", to: "(nothing)", arrow: "→", note: "Core has zero internal dependencies. Zod only." },
                ].map((row, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "200px 30px 260px 1fr", gap: 8, alignItems: "center", padding: "6px 8px", borderRadius: 4 }}>
                    <code style={{ fontSize: 11, color: "#4A6888" }}>{row.from}</code>
                    <span style={{ color: "#1E3028", fontSize: 14, textAlign: "center" }}>{row.arrow}</span>
                    <code style={{ fontSize: 11, color: "#2A4838" }}>{row.to}</code>
                    <span style={{ fontSize: 11, color: "#1E2A38" }}>{row.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── DATABASE SCHEMA TAB ─────────────────────── */}
        {tab === "db" && (
          <div className="fadein">
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: "#E0E8F0", marginBottom: 6 }}>
                The Postgres schema you write once
              </h2>
              <p style={{ color: "#2E3C50", fontSize: 12, lineHeight: 1.7 }}>
                You know Postgres. These core tables handle everything from v0.1 to v8.0. Future features add new tables or columns — never restructure these. The <code style={{ color: "#818CF8" }}>meta JSONB</code> column on every major table is intentional: future data that doesn't need indexing lives there without migrations.
              </p>
            </div>
            <div style={{
              background: "#07090E", border: "1px solid #0C1018",
              borderRadius: 10, padding: "20px 22px",
              overflowX: "auto",
            }}>
              <pre style={{
                fontSize: 11, lineHeight: 2, color: "#2A4858",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {DB_SCHEMA.split('\n').map((line, i) => {
                  const isComment = line.trim().startsWith('--');
                  const isCreate = line.trim().startsWith('CREATE');
                  const isCol = line.trim().match(/^\w+\s+(UUID|TEXT|BOOLEAN|BIGSERIAL|TIMESTAMPTZ|JSONB)/);
                  const isConstraint = line.trim().match(/^(PRIMARY|UNIQUE|REFERENCES|DEFAULT)/);
                  return (
                    <div key={i} style={{
                      color: isComment ? "#1E3A28"
                        : isCreate ? "#818CF8"
                        : isCol ? "#4A7868"
                        : isConstraint ? "#2A5040"
                        : "#2A4858",
                    }}>{line}</div>
                  );
                })}
              </pre>
            </div>

            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
              {[
                { table: "orgs + users + org_members", note: "Multi-tenancy from day one. Adding new user roles is one new role string — no schema change." },
                { table: "projects", note: "meta JSONB field stores future data (deploy_url, health_score, etc.) without migrations." },
                { table: "components + component_versions", note: "Immutable versioning built in. component_versions are append-only — never updated after publish." },
                { table: "subscriptions", note: "Single row per org, linked to Stripe. Plan changes = update this row. All billing logic gates on orgs.plan." },
                { table: "audit_log", note: "Append-only, BIGSERIAL PK. Never updated or deleted. Every action logged here. GDPR: export by user_id." },
                { table: "templates", note: "TEXT primary key (human-readable id). Official templates are seeded. Community templates are rows." },
              ].map((item, i) => (
                <div key={i} style={{ background: "#0A0E18", border: "1px solid #0E1520", borderRadius: 8, padding: "14px 16px" }}>
                  <code style={{ fontSize: 11, color: "#4A6888", display: "block", marginBottom: 6 }}>{item.table}</code>
                  <p style={{ fontSize: 11, color: "#2A3848", lineHeight: 1.6 }}>{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PRINCIPLES TAB ────────────────────────────── */}
        {tab === "principles" && (
          <div className="fadein">
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: "#E0E8F0", marginBottom: 6 }}>
                7 design principles — violate these and you'll rewrite
              </h2>
              <p style={{ color: "#2E3C50", fontSize: 12, lineHeight: 1.7 }}>
                These aren't preferences. They're structural decisions that compound in your favor for 10 years — or against you if you skip them.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PRINCIPLES.map((p, i) => (
                <div key={i} style={{
                  background: "#0A0E18", border: "1px solid #0E1520",
                  borderLeft: `3px solid ${p.color}`,
                  borderRadius: 10, padding: "20px 22px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ color: p.color, fontSize: 18 }}>{p.icon}</span>
                    <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, color: "#B0C0D0" }}>{p.title}</h3>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 10, color: p.color, letterSpacing: "0.12em", marginBottom: 6, textTransform: "uppercase" }}>The rule</div>
                      <p style={{ fontSize: 12, color: "#3A5060", lineHeight: 1.7 }}>{p.rule}</p>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "#1E3A28", letterSpacing: "0.12em", marginBottom: 6, textTransform: "uppercase" }}>Why it matters in year 5</div>
                      <p style={{ fontSize: 12, color: "#3A5060", lineHeight: 1.7 }}>{p.why}</p>
                    </div>
                  </div>
                  <div style={{ background: "#06080E", border: "1px solid #0C1018", borderRadius: 6, padding: "10px 14px" }}>
                    <span style={{ fontSize: 10, color: "#8B2020", letterSpacing: "0.1em", textTransform: "uppercase" }}>⚠ Anti-pattern: </span>
                    <span style={{ fontSize: 11, color: "#3A2020" }}>{p.antiPattern}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <div style={{ borderTop: "1px solid #0C1018", padding: "18px 28px", marginTop: 20 }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 10, color: "#141C28", letterSpacing: "0.1em" }}>APPINIT · FOUNDATION BLUEPRINT · START TODAY</span>
          <span style={{ fontSize: 10, color: "#141C28" }}>Node + React + Postgres developer · 8 gaps · 7 principles · 1 architecture</span>
        </div>
      </div>
    </div>
  );
}
