import { useState } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const YEARS = [
  {
    year: "Year 1",
    range: "2025–2026",
    theme: "Prove It Works",
    color: "#00E5A0",
    bg: "#00E5A010",
    releases: [
      {
        version: "v0.1.0",
        name: "Hello World",
        month: "Month 1–2",
        type: "INTERNAL",
        tagline: "You. Your machine. One working CLI.",
        goal: "Build confidence. Prove the core idea works end to end before anyone sees it.",
        youBuild: "React developer building this alone",
        features: [
          "npx appinit new my-app — single command that scaffolds a Next.js + Tailwind + TypeScript project",
          "Hardcoded template (no options yet) — just one perfect scaffold",
          "Auto-runs npm install after generation",
          "Generates: /app, /components, /lib, tailwind.config, tsconfig, .eslintrc, .prettierrc",
          "Pre-wired Vercel deployment config (vercel.json)",
          "One clean README with start/build/deploy instructions",
        ],
        stack: {
          language: "TypeScript",
          runtime: "Node.js 20+",
          keyLibs: ["commander (CLI args)", "fs-extra (file operations)", "chalk (colors in terminal)", "ora (spinner animations)", "handlebars (template variable injection)"],
          packageManager: "npm workspaces (monorepo from day 1)",
          testing: "vitest",
          publish: "npm publish (public package)",
        },
        milestone: "You run: npx appinit new test-app and a working Next.js app opens in your browser in under 60 seconds.",
        effort: "~3 weeks solo",
        revenue: "$0",
      },
      {
        version: "v0.2.0",
        name: "Choose Your Stack",
        month: "Month 2–3",
        type: "INTERNAL",
        tagline: "Interactive prompts. Multiple templates.",
        goal: "Let developers choose between framework options. First real developer experience work.",
        youBuild: "Still solo",
        features: [
          "Interactive CLI prompts: framework (Next.js / React Vite), CSS (Tailwind / CSS Modules), TypeScript yes/no",
          "Template system: templates stored as file-tree in /templates folder",
          "2 frontend templates: next-tailwind-ts, react-vite-tailwind-ts",
          "1 backend template: node-express-mongo",
          "appinit --help with beautiful formatted help text",
          "Basic .appinit.json config file generation",
          "Git init + first commit auto-run",
        ],
        stack: {
          language: "TypeScript",
          runtime: "Node.js 20+",
          keyLibs: ["@inquirer/prompts (interactive CLI)", "handlebars (template vars)", "execa (run shell commands like git, npm)"],
          packageManager: "npm workspaces",
          testing: "vitest + snapshot tests of generated file trees",
          publish: "npm",
        },
        milestone: "Post on Twitter/X: 'Built this CLI in a weekend. Scaffolds Next.js in 10 seconds.' Get first 50 GitHub stars.",
        effort: "~3 weeks solo",
        revenue: "$0",
      },
      {
        version: "v1.0.0",
        name: "Public Launch",
        month: "Month 3–5",
        type: "PUBLIC",
        tagline: "Production-ready. Zero config. Ship it.",
        goal: "First public release. Everything works perfectly. Documentation is excellent. Developers trust it.",
        youBuild: "Solo + 1 open-source contributor (find on Discord/GitHub)",
        features: [
          "5 production-ready templates: next-app-router, react-vite, node-express-rest, next-fullstack, node-fastify",
          "Zero-config auth: JWT pre-wired in backend templates",
          "Pre-configured ESLint + Prettier + Husky (pre-commit hooks)",
          "GitHub Actions CI workflow included in every template",
          "appinit --version, appinit list (show available templates)",
          "Beautiful terminal output with progress steps",
          "Full documentation site (built with Nextra/Next.js)",
          "README, CONTRIBUTING.md, issue templates on GitHub",
          "Automated tests: every template scaffolds + builds in CI",
        ],
        stack: {
          language: "TypeScript",
          runtime: "Node.js 20+",
          keyLibs: ["commander", "@inquirer/prompts", "handlebars", "execa", "chalk", "ora", "fs-extra", "zod (config validation)"],
          docs: "Nextra (Next.js-based docs site)",
          hosting: "Vercel (free tier for docs)",
          ci: "GitHub Actions",
          testing: "vitest + e2e scaffold tests",
          publish: "npm",
        },
        milestone: "Launch on Product Hunt. 500 GitHub stars. 1,000 CLI downloads. Dev.to post goes viral.",
        effort: "~6 weeks",
        revenue: "$0 (building audience)",
      },
      {
        version: "v1.1.0",
        name: "Community Templates",
        month: "Month 5–7",
        type: "PUBLIC",
        tagline: "The community starts contributing.",
        goal: "Open the template system so others can contribute. Grow the catalog without you doing all the work.",
        youBuild: "Solo + growing open source community",
        features: [
          "Template contribution guide: how to add a new template via PR",
          "appinit list --community (show community-contributed templates)",
          "Template validation CI: auto-tests every new template PR",
          "Vue 3 + Pinia + Vite template (community contributed)",
          "Astro + Tailwind template",
          "T3 Stack template (Next + tRPC + Prisma + Tailwind)",
          "appinit info [template] — show template details, author, last updated",
          "Template ratings and usage stats on docs site",
        ],
        stack: {
          language: "TypeScript",
          runtime: "Node.js",
          newAdditions: ["Simple JSON template registry (hosted on GitHub)", "GitHub Actions template validation pipeline"],
          hosting: "GitHub (template registry as JSON file in repo)",
        },
        milestone: "10 community templates. 2,000 GitHub stars. First Discord server with 200+ members.",
        effort: "~4 weeks",
        revenue: "$0",
      },
    ],
  },
  {
    year: "Year 2",
    range: "2026–2027",
    theme: "Make Money. Serve Agencies.",
    color: "#818CF8",
    bg: "#818CF810",
    releases: [
      {
        version: "v1.2.0",
        name: "Component Registry MVP",
        month: "Month 8–11",
        type: "PAID",
        tagline: "Your components. Versioned. Shared. Private.",
        goal: "First paid feature. Agencies need a private registry. This is the $199/mo product.",
        youBuild: "You + 1 backend hire (part-time freelancer) OR learn basics yourself",
        features: [
          "appinit component push Button — uploads component to private registry",
          "appinit component pull Button — downloads into current project",
          "Versioning: semver for every component",
          "Private registry per organization (isolated storage)",
          "Web dashboard v1: login, view components, see versions",
          "appinit login / appinit logout — API key authentication",
          "Component metadata: name, framework, version, author, last updated",
          "Basic team management: invite teammates by email",
        ],
        stack: {
          language: "TypeScript (full stack)",
          frontend: "Next.js App Router (dashboard UI — you already know React!)",
          backend: "Next.js API Routes or Hono.js (lightweight, fast)",
          database: "PostgreSQL via Neon.tech (serverless Postgres, free tier)",
          orm: "Prisma (schema-first, great DX)",
          auth: "Clerk (handles login/signup/teams — plug and play)",
          storage: "Cloudflare R2 (S3-compatible, cheap) for component files",
          hosting: "Vercel (frontend + API routes)",
          email: "Resend (transactional email)",
        },
        milestone: "First 5 paying agency customers at $199/mo = $995 MRR. Prove someone will pay.",
        effort: "~8 weeks (this is a big jump — your first backend/infra work)",
        revenue: "$199/mo per org",
      },
      {
        version: "v1.3.0",
        name: "AI Setup Assistant",
        month: "Month 11–14",
        type: "PAID",
        tagline: "Type what you want. Get a scaffold config.",
        goal: "Add the first AI feature. Differentiate from every other CLI tool on the market.",
        youBuild: "You — this is mostly prompt engineering + API calls, very doable as a React dev",
        features: [
          "appinit ai init — opens chat-style terminal prompt",
          "Type: 'Next.js app with Stripe payments, Clerk auth, Postgres' → generates .appinit.json",
          "Web UI version: text box in dashboard → live config preview",
          "AI suggests template + features based on description",
          "Config explanation: AI tells you WHY it chose each option",
          "Save and reuse prompts as team templates",
          "Usage metering: track AI calls per org for billing",
        ],
        stack: {
          language: "TypeScript",
          ai: "Anthropic Claude API (claude-sonnet) — structured JSON output via tool_use",
          newAdditions: ["Anthropic SDK (@anthropic-ai/sdk)", "Streaming responses for terminal feel", "Usage tracking in Postgres"],
        },
        milestone: "500 AI configs generated in month 1. Feature in a dev newsletter. MRR hits $3k.",
        effort: "~4 weeks",
        revenue: "Included in Agency plan; AI usage cap on free tier",
      },
      {
        version: "v2.0.0",
        name: "Dashboard & Teams",
        month: "Month 14–18",
        type: "PAID",
        tagline: "A real product. Not just a CLI.",
        goal: "The web dashboard becomes a first-class product. Visual project management for agencies.",
        youBuild: "You (React is your zone) + backend freelancer for complex APIs",
        features: [
          "Full @appinit/ui dashboard: projects overview, health scores, last activity",
          "Visual project scaffolding wizard (no CLI needed)",
          "Org management: roles (owner, editor, viewer), invite flow",
          "Component registry explorer with live preview iframe",
          "Project timeline: scaffold date, last updated, template version",
          "appinit upgrade — update a project to latest template version",
          "Billing portal (Stripe Customer Portal embedded)",
          "Usage dashboard: AI credits, storage used, seats",
        ],
        stack: {
          frontend: "Next.js App Router + Tailwind + shadcn/ui",
          backend: "Hono.js on Cloudflare Workers (fast, cheap, global)",
          database: "Neon Postgres + Redis via Upstash (caching)",
          payments: "Stripe (subscriptions, customer portal, webhooks)",
          componentPreview: "iframe sandbox with Sandpack (CodeSandbox's component)",
          monitoring: "Sentry (error tracking)",
        },
        milestone: "20 paying orgs. $8k MRR. First agency says 'we can't work without this.'",
        effort: "~10 weeks (biggest release so far)",
        revenue: "Free / $49 Pro / $199 Agency / $499 Enterprise (first tiers)",
      },
    ],
  },
  {
    year: "Year 3",
    range: "2027–2028",
    theme: "AI Everything. Marketplace Opens.",
    color: "#F97316",
    bg: "#F9731610",
    releases: [
      {
        version: "v2.1.0",
        name: "AI Component Generator",
        month: "Month 19–22",
        type: "PAID",
        tagline: "Describe it. Get production code.",
        goal: "Turn text into real components. The feature that makes senior devs tell junior devs to use AppInit.",
        youBuild: "You — AI prompt engineering is the hard part, not the code",
        features: [
          "appinit ai component 'A pricing table with 3 tiers, Tailwind, dark mode'",
          "Generates: component.tsx + component.test.tsx + component.stories.tsx",
          "Design-system aware: reads your tailwind.config and tokens",
          "Framework detection: generates React or Vue based on project",
          "One-click push generated component to registry",
          "Iteration: 'make it responsive' / 'add hover states' refinement loop",
          "Accessibility by default: WCAG 2.1 AA compliant output",
        ],
        stack: {
          ai: "Claude claude-sonnet-4-20250514 with extended thinking for complex components",
          newAdditions: ["AST parsing (ts-morph) to read existing codebase context", "Sandpack for live preview in dashboard"],
        },
        milestone: "10,000 AI components generated. Feature on Hacker News front page.",
        effort: "~6 weeks",
        revenue: "Usage-based AI credits (pay per generation above free tier)",
      },
      {
        version: "v2.2.0",
        name: "Marketplace Beta",
        month: "Month 22–26",
        type: "PUBLIC",
        tagline: "Sell your work. Buy others'. The developer economy starts.",
        goal: "Open a marketplace. Let AppInit users earn money. This is the flywheel.",
        youBuild: "You + 1 full-time hire (your first employee — a backend engineer)",
        features: [
          "Marketplace: browse and purchase templates, component packs",
          "Seller onboarding: any developer can list their template/components",
          "Stripe Connect: sellers get paid directly, AppInit takes 20%",
          "License types: personal, commercial, unlimited",
          "Template detail page: live demo, changelog, reviews, author profile",
          "Seller dashboard: revenue, downloads, ratings",
          "Featured and trending sections",
          "Template certification program: AppInit-verified badge",
        ],
        stack: {
          payments: "Stripe Connect (marketplace payments — this is non-trivial, plan extra time)",
          newAdditions: ["Algolia (search for marketplace)", "Cloudflare Images (template screenshots/previews)"],
        },
        milestone: "100 templates listed. First seller earns $1,000. AppInit earns first marketplace revenue.",
        effort: "~10 weeks",
        revenue: "20% commission on all marketplace sales",
      },
    ],
  },
  {
    year: "Year 4",
    range: "2028–2029",
    theme: "Enterprise & Continuous Maintenance",
    color: "#FBBF24",
    bg: "#FBBF2410",
    releases: [
      {
        version: "v3.0.0",
        name: "AI Dependency Watcher",
        month: "Month 27–31",
        type: "ENTERPRISE",
        tagline: "Your projects never go stale. Security never slips.",
        goal: "Proactive maintenance. The feature that justifies AppInit as an ongoing subscription, not just a setup tool.",
        youBuild: "Team of 4–5 (you, 2 backend, 1 frontend, 1 DevRel)",
        features: [
          "Daily scans of all org projects against npm advisory database",
          "CVE severity alerts (Critical/High/Medium) via email + Slack",
          "Automated PR generation: 'Update lodash to 4.17.22 (Critical CVE)'",
          "PR includes: what changed, risk assessment, test results",
          "Dependency health score per project (A–F grade)",
          "Template version adoption: 'Project X is 3 versions behind current template'",
          "Weekly digest email: org-wide security posture summary",
          "appinit audit — run on-demand from CLI",
        ],
        stack: {
          newAdditions: ["Cron jobs via Trigger.dev (reliable background jobs)", "GitHub App (to open PRs on behalf of users)", "OSV.dev API (open source vulnerability database — free)"],
          jobs: "Trigger.dev for scheduled scans",
          notifications: "Resend (email) + Slack API (webhooks)",
        },
        milestone: "First enterprise customer signs $2k/mo contract specifically for the security alerting.",
        effort: "~8 weeks",
        revenue: "Enterprise tier add-on: $199/mo per org",
      },
      {
        version: "v3.1.0",
        name: "AI Sync Proposer",
        month: "Month 31–35",
        type: "ENTERPRISE",
        tagline: "Update one component. All 30 client projects get PRs.",
        goal: "The agency superpower. Update a shared component once — AppInit propagates it everywhere.",
        youBuild: "Team of 5–6",
        features: [
          "When a registry component is updated → auto-detect all dependent projects",
          "Open a PR in every dependent project with the updated component",
          "PR includes: visual diff, impact analysis, 'approve all' button",
          "Conflict detection: flag projects where local changes clash",
          "Batch approval UI: see all pending syncs, approve/reject in bulk",
          "Rollback: revert any sync with one click",
          "Audit log: who approved what sync, when, for compliance",
        ],
        stack: {
          newAdditions: ["GitHub App (enhanced — PR creation, branch management)", "Diff computation engine (diff2html for visual diffs)"],
        },
        milestone: "Agency with 40 client projects uses Sync Proposer to push a security fix to all 40 in 10 minutes. Case study published.",
        effort: "~10 weeks",
        revenue: "Gated to Enterprise plan ($999/mo+)",
      },
    ],
  },
  {
    year: "Year 5",
    range: "2029–2030",
    theme: "Cloud Infrastructure. AppInit Deploys Too.",
    color: "#34D399",
    bg: "#34D39910",
    releases: [
      {
        version: "v4.0.0",
        name: "AppInit Cloud",
        month: "Month 36–44",
        type: "CLOUD",
        tagline: "From scaffold to live URL in 90 seconds.",
        goal: "AppInit doesn't just scaffold — it deploys. One platform for the entire project lifecycle.",
        youBuild: "Team of 8–10",
        features: [
          "appinit deploy — detect framework, build, deploy automatically",
          "Preview URLs per pull request (isolated environments)",
          "One-click custom domain + SSL setup",
          "Environment variable management UI (dev/staging/prod isolation)",
          "Real-time build log streaming",
          "Rollback to any previous deployment",
          "Usage-based pricing (like Vercel/Railway but integrated with AppInit workflow)",
          "IaC generation: Terraform/Docker Compose output from project config",
        ],
        stack: {
          infrastructure: "Cloudflare Workers + Pages (edge deployment)",
          containers: "Fly.io or Railway API (for Node.js backends)",
          dns: "Cloudflare DNS API",
          ssl: "Cloudflare (automatic)",
          builds: "Custom build runner on Fly.io machines",
        },
        milestone: "$50k MRR. AppInit becomes the default platform for 500+ agencies end to end.",
        effort: "~16 weeks (largest engineering effort)",
        revenue: "Usage-based cloud revenue on top of subscriptions",
      },
    ],
  },
  {
    year: "Years 6–7",
    range: "2030–2032",
    theme: "Plugin Ecosystem. Enterprise Dominance.",
    color: "#F472B6",
    bg: "#F472B610",
    releases: [
      {
        version: "v5.0.0",
        name: "Plugin SDK",
        month: "Month 45–54",
        type: "ECOSYSTEM",
        tagline: "Extend everything. Build on AppInit.",
        goal: "Open AppInit to third-party developers. VS Code did this. AppInit does it for dev workflows.",
        youBuild: "Team of 12–15",
        features: [
          "Plugin manifest schema: appinit-plugin.json",
          "CLI extension API: add new appinit commands via plugins",
          "UI panel injection: third-parties add panels to dashboard",
          "Official plugins: GitHub, GitLab, JIRA, Slack, Linear, Figma",
          "Plugin marketplace: discover, install, manage plugins",
          "VS Code extension: AppInit sidebar for component/template actions",
          "Plugin revenue sharing: paid plugins earn creators 70%",
          "Plugin certification program",
        ],
        stack: {
          pluginRuntime: "Sandboxed Node.js workers (via vm2 or isolated-vm)",
          pluginRegistry: "Separate npm-like registry for plugins",
        },
        milestone: "100 third-party plugins. SaaS companies (Clerk, Stripe, Supabase) publish official AppInit plugins.",
        revenue: "Plugin marketplace commissions + enterprise plugin support contracts",
      },
    ],
  },
  {
    year: "Years 8–10",
    range: "2032–2035",
    theme: "The Dev OS. Unassailable Market Position.",
    color: "#A78BFA",
    bg: "#A78BFA10",
    releases: [
      {
        version: "v6.0.0",
        name: "AI Migration Agent",
        month: "Year 8",
        type: "ENTERPRISE",
        tagline: "Every legacy codebase has a path to AppInit.",
        goal: "The $50k–$500k enterprise deal closer. Companies pay enormous amounts to modernize legacy code.",
        youBuild: "Team of 20+",
        features: [
          "Analyze any codebase (CRA, jQuery, plain Express) → migration plan",
          "Automated code transformations via AST (codemods)",
          "Risk scoring per migration step",
          "Human-in-the-loop: flags manual steps clearly",
          "Post-migration AppInit config generation",
          "Migration progress dashboard with rollback checkpoints",
          "Integrates with enterprise ticketing (JIRA auto-tasks per step)",
        ],
        revenue: "Migration-as-a-service: $25k–$250k per enterprise engagement",
      },
      {
        version: "v7.0.0",
        name: "Governance & Compliance OS",
        month: "Year 9",
        type: "ENTERPRISE",
        tagline: "Policy as Code. Compliance on autopilot.",
        goal: "Lock in regulated industries: HealthTech, FinTech, GovTech. These pay the most.",
        youBuild: "Dedicated compliance engineering team",
        features: [
          "Policy as Code: define org-wide rules (no lodash < 4.17, always TypeScript strict)",
          "GDPR/HIPAA/SOC2 checklist generation per template",
          "License compliance scanning (MIT/Apache/GPL conflict detection)",
          "Security posture scoring A–F per project",
          "Compliance audit report export (ready for auditors)",
          "CIS benchmark checks for deployed infrastructure",
          "Automated violation PRs with fix suggestions",
        ],
        revenue: "Compliance tier: $5k–$50k/mo for regulated enterprises",
      },
      {
        version: "v8.0.0",
        name: "AppInit OS — Full DevOS",
        month: "Year 10",
        type: "PLATFORM",
        tagline: "The operating system for software development.",
        goal: "AppInit is the default layer between idea and production for every software team on earth.",
        youBuild: "Company of 50–100",
        features: [
          "Unified platform: scaffold → build → deploy → monitor → maintain → comply",
          "AI pair that knows your entire org's codebase history",
          "White-label licensing for enterprises to run AppInit internally",
          "AppInit Academy: certification courses for developers and agencies",
          "Global template marketplace with millions of components",
          "AppInit for Education: university partnerships",
          "Open AppInit Foundation: governance of the open-source core",
        ],
        revenue: "$10M+ ARR target. Multiple revenue streams compounding.",
      },
    ],
  },
];

const FULL_STACK = [
  {
    category: "CLI Tool",
    color: "#00E5A0",
    icon: "⌨",
    items: [
      { name: "TypeScript", why: "Type safety across the whole codebase. You already know JS — TS is just JS with guardrails.", learn: "1 week" },
      { name: "Node.js 20+", why: "Runs your CLI. You already have this if you do React development.", learn: "Already know it" },
      { name: "commander", why: "Parses CLI commands and flags. Tiny library, 30 min to learn.", learn: "30 min" },
      { name: "@inquirer/prompts", why: "Beautiful interactive terminal prompts. Powers the 'choose your framework' flow.", learn: "1 hour" },
      { name: "handlebars", why: "Template engine. Injects variables like {{projectName}} into your scaffold files.", learn: "2 hours" },
      { name: "execa", why: "Runs shell commands (npm install, git init) from your Node.js code.", learn: "1 hour" },
      { name: "chalk + ora", why: "Colors and spinners in the terminal. Makes your CLI feel premium.", learn: "1 hour" },
      { name: "fs-extra", why: "Copies, creates, moves files. The filesystem operations library.", learn: "1 hour" },
      { name: "zod", why: "Validates your .appinit.json config file. You may already know this from React work.", learn: "2 hours" },
    ],
  },
  {
    category: "Backend API",
    color: "#818CF8",
    icon: "⚙",
    items: [
      { name: "Hono.js", why: "Lightweight, fast API framework. Much simpler than Express. Runs on Cloudflare Workers. Learn this over Express.", learn: "1 week" },
      { name: "Prisma ORM", why: "Define your database schema in TypeScript. Auto-generates typed queries. No raw SQL needed.", learn: "3 days" },
      { name: "PostgreSQL via Neon", why: "Serverless Postgres. No server to manage. Free tier is generous. Neon scales automatically.", learn: "2 days" },
      { name: "Zod", why: "Validate all API request bodies. Prevents garbage data entering your DB.", learn: "Already learning for CLI" },
      { name: "Trigger.dev", why: "Background jobs and cron scheduling. Used for AI Dependency Watcher scans. Much easier than raw queues.", learn: "3 days" },
      { name: "Upstash Redis", why: "Serverless Redis for caching and rate limiting. Pay per request, no server.", learn: "1 day" },
    ],
  },
  {
    category: "Frontend Dashboard",
    color: "#F97316",
    icon: "◻",
    items: [
      { name: "Next.js App Router", why: "You're a React dev — this is your territory. Use what you know.", learn: "Already know it" },
      { name: "Tailwind CSS", why: "Utility-first CSS. Fast to build with, consistent output.", learn: "Already know it (likely)" },
      { name: "shadcn/ui", why: "Copy-paste component library. Beautiful, accessible, customizable. Not a dependency, just code.", learn: "2 days" },
      { name: "Zustand", why: "Simple global state for the dashboard. Much simpler than Redux.", learn: "1 day" },
      { name: "TanStack Query", why: "Server state management. Handles loading, caching, refetching from your API.", learn: "3 days" },
      { name: "Sandpack", why: "CodeSandbox's component for live code previews. Embed in your dashboard to preview components.", learn: "2 days" },
    ],
  },
  {
    category: "Auth & Payments",
    color: "#FBBF24",
    icon: "◈",
    items: [
      { name: "Clerk", why: "Complete auth in 30 minutes. Login, signup, org management, SSO. Don't build auth yourself.", learn: "1 day" },
      { name: "Stripe", why: "Subscriptions, one-time payments, customer portal. The only choice for SaaS payments.", learn: "3 days" },
      { name: "Stripe Connect", why: "Marketplace payments. Needed when sellers earn money. More complex — save for Year 3.", learn: "1 week (later)" },
    ],
  },
  {
    category: "AI Layer",
    color: "#34D399",
    icon: "◆",
    items: [
      { name: "Anthropic Claude API", why: "Best for structured output (JSON configs, code generation). Use claude-sonnet for speed+quality balance.", learn: "2 days" },
      { name: "Vercel AI SDK", why: "Makes streaming AI responses to your Next.js frontend dead simple. Works with Claude.", learn: "2 days" },
      { name: "ts-morph", why: "TypeScript AST manipulation. Used by AI Migration Agent to transform code programmatically.", learn: "1 week (Year 8)" },
    ],
  },
  {
    category: "Infrastructure",
    color: "#F472B6",
    icon: "◷",
    items: [
      { name: "Vercel", why: "Deploy your Next.js dashboard. Free tier is perfect for early stages.", learn: "Already know it" },
      { name: "Cloudflare R2", why: "Object storage for component files. S3-compatible API, much cheaper than AWS S3.", learn: "1 day" },
      { name: "Cloudflare Workers", why: "Edge API hosting for Hono.js backend. Extremely fast, cheap, global.", learn: "3 days" },
      { name: "GitHub Actions", why: "CI/CD. Run tests, validate templates, deploy on merge. You'll use this constantly.", learn: "2 days" },
      { name: "Resend", why: "Transactional email (welcome, alerts, billing). Simple API, great deliverability.", learn: "2 hours" },
      { name: "Sentry", why: "Error tracking. Know when things break in production before users complain.", learn: "2 hours" },
    ],
  },
  {
    category: "DevOps & Monitoring",
    color: "#A78BFA",
    icon: "◑",
    items: [
      { name: "Fly.io", why: "Deploy containerized Node.js servers when Cloudflare Workers isn't enough.", learn: "2 days" },
      { name: "Axiom / Logtail", why: "Log aggregation. Search your API logs without setting up ELK stack.", learn: "1 day" },
      { name: "Algolia", why: "Search for your marketplace. Much better than building search yourself.", learn: "2 days" },
      { name: "OSV.dev API", why: "Free vulnerability database. Used by AI Dependency Watcher to check CVEs.", learn: "1 day" },
    ],
  },
];

const FIRST_30_DAYS = [
  { day: "Day 1–2", task: "Set up your monorepo", detail: "mkdir appinit && npm init -y && set up npm workspaces with packages/cli and packages/core folders. Install TypeScript, vitest, prettier globally.", type: "setup" },
  { day: "Day 3–5", task: "Build the file generator", detail: "Write the core function that takes a template folder and copies it to a destination, replacing {{variables}} using handlebars. Test it with a simple /templates/next-app folder you create manually.", type: "code" },
  { day: "Day 6–8", task: "Add the CLI entry point", detail: "Set up commander with one command: appinit new [name]. Wire it to your file generator. Make it print colored output with chalk and a spinner with ora.", type: "code" },
  { day: "Day 9–12", task: "Build your first template", detail: "Create /templates/next-tailwind-ts — a minimal but complete Next.js App Router + Tailwind + TypeScript project. Include: app/page.tsx, tailwind.config.ts, tsconfig.json, .eslintrc.json, .prettierrc, vercel.json, README.md.", type: "template" },
  { day: "Day 13–15", task: "Wire it all together", detail: "Running npx ts-node src/index.ts new my-app should generate the full project into ./my-app, run npm install, run git init, and print 'Done! cd my-app && npm run dev'", type: "code" },
  { day: "Day 16–18", task: "Add interactive prompts", detail: "Replace hardcoded template with @inquirer/prompts questions: 'Which framework? (Next.js / React Vite)', 'Add TypeScript? (yes)', 'Add Tailwind? (yes)'. Use answers to select correct template.", type: "code" },
  { day: "Day 19–21", task: "Write tests", detail: "Use vitest to test: file generation works, variables are replaced, directory structure is correct, generated project builds successfully (execa npm run build in test).", type: "test" },
  { day: "Day 22–24", task: "Set up GitHub + CI", detail: "Push to GitHub. Add GitHub Actions workflow that runs your tests on every PR. This is also your first dogfooding: use your own Next.js template to scaffold the docs site.", type: "infra" },
  { day: "Day 25–27", task: "Build the docs site", detail: "Use Nextra (npm create next-app). Write: Getting Started, Available Templates, Contributing. Deploy to Vercel in 10 minutes.", type: "docs" },
  { day: "Day 28–30", task: "npm publish + announce", detail: "npm publish --access public. Test: npx @appinit/cli new test-project works from scratch. Post on Twitter, Dev.to, Reddit r/webdev. Open GitHub Discussions for feedback.", type: "launch" },
];

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

const TAG = ({ label, color }) => (
  <span style={{
    fontSize: 9,
    letterSpacing: "0.14em",
    padding: "2px 7px",
    borderRadius: 3,
    border: `1px solid ${color}40`,
    background: `${color}12`,
    color,
    fontWeight: 500,
    whiteSpace: "nowrap",
  }}>{label}</span>
);

const typeColor = {
  INTERNAL: "#555",
  PUBLIC: "#00E5A0",
  PAID: "#818CF8",
  ENTERPRISE: "#FBBF24",
  CLOUD: "#34D399",
  ECOSYSTEM: "#F472B6",
  PLATFORM: "#A78BFA",
};

export default function AppInit10Year() {
  const [activeTab, setActiveTab] = useState("roadmap");
  const [expandedRelease, setExpandedRelease] = useState("v1.0.0");
  const [activeYear, setActiveYear] = useState(0);
  const [expandedStack, setExpandedStack] = useState("CLI Tool");

  const tabs = [
    { id: "roadmap", label: "10-Year Roadmap" },
    { id: "stack", label: "Tech Stack" },
    { id: "day1", label: "First 30 Days" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#07090D",
      color: "#D4D8E0",
      fontFamily: "'IBM Plex Mono', 'Fira Code', monospace",
      fontSize: 13,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Clash+Display:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: #1E2530; border-radius: 2px; }
        .rel-card { transition: border-color 0.2s; cursor: pointer; }
        .rel-card:hover { border-color: #2A3040 !important; }
        .stack-row:hover { background: rgba(255,255,255,0.025); }
        .day-row:hover { background: rgba(255,255,255,0.02); }
        @keyframes in { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .ani { animation: in 0.25s ease forwards; }
        .year-btn { transition: all 0.15s; cursor: pointer; border: none; font-family: inherit; }
        .year-btn:hover { opacity: 0.85; }
        .tab-btn { transition: all 0.15s; cursor: pointer; border: none; font-family: inherit; }
      `}</style>

      {/* HEADER */}
      <div style={{ borderBottom: "1px solid #10131A", padding: "36px 28px 28px", background: "#07090D" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#3A4050", marginBottom: 14, textTransform: "uppercase" }}>
            AppInit · 10-Year Engineering Blueprint · Release by Release
          </div>
          <h1 style={{
            fontFamily: "'Clash Display', 'Syne', sans-serif",
            fontSize: "clamp(26px, 4vw, 52px)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            marginBottom: 14,
            color: "#E8EDF5",
          }}>
            From <span style={{ color: "#00E5A0" }}>v0.1</span> to<br />
            <span style={{ color: "#3A4050" }}>the Dev OS</span>
          </h1>
          <p style={{ color: "#3E4860", fontSize: 12, maxWidth: 420, lineHeight: 1.7 }}>
            Built by a React developer. Release by release. Every version, every feature, every piece of tech you need to learn — in order.
          </p>
        </div>
      </div>

      {/* TABS */}
      <div style={{ borderBottom: "1px solid #10131A", padding: "0 28px", background: "#07090D", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex" }}>
          {tabs.map(t => (
            <button key={t.id} className="tab-btn"
              onClick={() => setActiveTab(t.id)}
              style={{
                background: "none", padding: "14px 18px",
                fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
                color: activeTab === t.id ? "#00E5A0" : "#2E3848",
                borderBottom: activeTab === t.id ? "2px solid #00E5A0" : "2px solid transparent",
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px" }}>

        {/* ── ROADMAP TAB ──────────────────────────────────── */}
        {activeTab === "roadmap" && (
          <div className="ani">
            {/* Year selector */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
              {YEARS.map((y, i) => (
                <button key={i} className="year-btn"
                  onClick={() => setActiveYear(i)}
                  style={{
                    background: activeYear === i ? `${y.color}18` : "#0D1018",
                    border: `1px solid ${activeYear === i ? y.color : "#18202C"}`,
                    borderRadius: 6, padding: "8px 14px",
                    color: activeYear === i ? y.color : "#3A4860",
                    fontSize: 11, letterSpacing: "0.08em",
                  }}>
                  <span style={{ fontWeight: 600 }}>{y.year}</span>
                  <span style={{ opacity: 0.6, marginLeft: 6, fontSize: 10 }}>{y.range}</span>
                </button>
              ))}
            </div>

            {/* Year detail */}
            {(() => {
              const y = YEARS[activeYear];
              return (
                <div className="ani" key={activeYear}>
                  {/* Year header */}
                  <div style={{
                    background: y.bg,
                    border: `1px solid ${y.color}25`,
                    borderLeft: `3px solid ${y.color}`,
                    borderRadius: 10,
                    padding: "20px 24px",
                    marginBottom: 20,
                    display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12
                  }}>
                    <div>
                      <div style={{ fontSize: 10, color: y.color, letterSpacing: "0.15em", marginBottom: 4 }}>{y.year} · {y.range}</div>
                      <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 22, fontWeight: 700, color: "#E8EDF5" }}>{y.theme}</h2>
                    </div>
                    <div style={{ fontSize: 10, color: "#2E3848" }}>{y.releases.length} release{y.releases.length > 1 ? "s" : ""} this year</div>
                  </div>

                  {/* Releases */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {y.releases.map((rel, ri) => {
                      const isOpen = expandedRelease === rel.version;
                      const tc = typeColor[rel.type] || "#888";
                      return (
                        <div key={ri} className="rel-card"
                          onClick={() => setExpandedRelease(isOpen ? null : rel.version)}
                          style={{
                            background: "#0D1018",
                            border: `1px solid ${isOpen ? y.color + "40" : "#14191F"}`,
                            borderRadius: 10, overflow: "hidden",
                          }}>
                          {/* Release header */}
                          <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                              <span style={{
                                fontFamily: "'Clash Display', sans-serif",
                                fontSize: 16, fontWeight: 700,
                                color: isOpen ? y.color : "#4A5568",
                              }}>{rel.version}</span>
                              <div>
                                <div style={{ fontSize: 13, color: "#C8D0DC", fontWeight: 500 }}>{rel.name}</div>
                                <div style={{ fontSize: 11, color: "#2E3848", marginTop: 2 }}>{rel.tagline}</div>
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                              <TAG label={rel.type} color={tc} />
                              <TAG label={rel.month} color="#2E3848" />
                              <span style={{ color: "#1E2530", fontSize: 14 }}>{isOpen ? "▲" : "▼"}</span>
                            </div>
                          </div>

                          {/* Expanded content */}
                          {isOpen && (
                            <div style={{ padding: "0 20px 20px", borderTop: `1px solid #10131A` }}>
                              <div style={{ paddingTop: 18 }}>
                                <p style={{ color: "#4A5878", fontSize: 12, lineHeight: 1.7, marginBottom: 18 }}>{rel.goal}</p>

                                {/* Two column layout */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                                  {/* Features */}
                                  <div style={{ gridColumn: "1 / -1" }}>
                                    <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#2E3848", marginBottom: 10, textTransform: "uppercase" }}>Features in this release</div>
                                    <div style={{
                                      background: "#09111A",
                                      border: "1px solid #10181F",
                                      borderRadius: 8, padding: "12px 16px",
                                    }}>
                                      {rel.features.map((f, fi) => (
                                        <div key={fi} style={{ display: "flex", gap: 10, padding: "5px 0", borderBottom: fi < rel.features.length - 1 ? "1px solid #0C141C" : "none" }}>
                                          <span style={{ color: y.color, flexShrink: 0, fontSize: 10, marginTop: 3 }}>▸</span>
                                          <span style={{ color: "#606E84", fontSize: 12, lineHeight: 1.5 }}>{f}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Stack + meta row */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                                  {/* Tech stack */}
                                  {rel.stack && (
                                    <div style={{ background: "#09111A", border: "1px solid #10181F", borderRadius: 8, padding: "14px 16px" }}>
                                      <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#2E3848", marginBottom: 10, textTransform: "uppercase" }}>Tech stack</div>
                                      {Object.entries(rel.stack).map(([k, v]) => (
                                        <div key={k} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                                          <span style={{ color: "#2A3040", fontSize: 10, minWidth: 80, textTransform: "capitalize", letterSpacing: "0.05em", marginTop: 1 }}>{k}</span>
                                          <span style={{ color: "#4A5878", fontSize: 11, lineHeight: 1.5 }}>
                                            {Array.isArray(v) ? v.join(", ") : v}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Meta */}
                                  <div style={{ background: "#09111A", border: "1px solid #10181F", borderRadius: 8, padding: "14px 16px" }}>
                                    <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#2E3848", marginBottom: 10, textTransform: "uppercase" }}>Meta</div>
                                    {[
                                      ["Who builds", rel.youBuild],
                                      ["Effort", rel.effort],
                                      ["Revenue", rel.revenue],
                                    ].filter(([, v]) => v).map(([k, v]) => (
                                      <div key={k} style={{ marginBottom: 8 }}>
                                        <div style={{ fontSize: 10, color: "#2A3040", letterSpacing: "0.08em", marginBottom: 2 }}>{k}</div>
                                        <div style={{ fontSize: 12, color: "#4A5878", lineHeight: 1.5 }}>{v}</div>
                                      </div>
                                    ))}
                                    {rel.milestone && (
                                      <>
                                        <div style={{ fontSize: 10, color: "#2A3040", letterSpacing: "0.08em", marginBottom: 4, marginTop: 8, textTransform: "uppercase" }}>🎯 Milestone</div>
                                        <div style={{ fontSize: 11, color: y.color, lineHeight: 1.6 }}>{rel.milestone}</div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Timeline summary bar */}
            <div style={{ marginTop: 36, border: "1px solid #10131A", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #10131A" }}>
                <span style={{ fontSize: 10, letterSpacing: "0.15em", color: "#2E3848", textTransform: "uppercase" }}>10-Year Release Timeline</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0 }}>
                {YEARS.map((y, i) => (
                  <div key={i}
                    style={{
                      padding: "12px 10px",
                      borderRight: i < YEARS.length - 1 ? "1px solid #10131A" : "none",
                      background: activeYear === i ? y.bg : "transparent",
                      cursor: "pointer",
                    }}
                    onClick={() => setActiveYear(i)}
                  >
                    <div style={{ fontSize: 9, color: y.color, letterSpacing: "0.1em", marginBottom: 4 }}>{y.year}</div>
                    <div style={{ fontSize: 9, color: "#2E3848", marginBottom: 6 }}>{y.range}</div>
                    {y.releases.map((r, ri) => (
                      <div key={ri} style={{
                        fontSize: 9, padding: "2px 5px", borderRadius: 3,
                        background: `${typeColor[r.type] || "#888"}15`,
                        color: typeColor[r.type] || "#888",
                        marginBottom: 2, letterSpacing: "0.05em"
                      }}>{r.version}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STACK TAB ──────────────────────────────────── */}
        {activeTab === "stack" && (
          <div className="ani">
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 20, fontWeight: 700, color: "#E8EDF5", marginBottom: 6 }}>
                Complete Tech Stack — As a React Developer
              </h2>
              <p style={{ color: "#3A4860", fontSize: 12, lineHeight: 1.7 }}>
                Everything you need to know, in the order you need to learn it. Nothing unnecessary. Your React knowledge is the foundation — everything else builds on it.
              </p>
            </div>

            {/* Stack category selector */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
              {FULL_STACK.map(cat => (
                <button key={cat.category} className="year-btn"
                  onClick={() => setExpandedStack(cat.category)}
                  style={{
                    background: expandedStack === cat.category ? `${cat.color}18` : "#0D1018",
                    border: `1px solid ${expandedStack === cat.category ? cat.color : "#14191F"}`,
                    borderRadius: 6, padding: "7px 12px",
                    color: expandedStack === cat.category ? cat.color : "#3A4860",
                    fontSize: 10, letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 6,
                  }}>
                  <span>{cat.icon}</span> {cat.category}
                </button>
              ))}
            </div>

            {FULL_STACK.filter(c => c.category === expandedStack).map(cat => (
              <div key={cat.category} className="ani">
                <div style={{ border: "1px solid #10131A", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid #10131A", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: cat.color, letterSpacing: "0.12em", textTransform: "uppercase" }}>{cat.icon} {cat.category}</span>
                    <span style={{ fontSize: 10, color: "#2E3848" }}>{cat.items.length} technologies</span>
                  </div>
                  {cat.items.map((item, i) => (
                    <div key={i} className="stack-row" style={{
                      display: "grid", gridTemplateColumns: "180px 1fr 90px",
                      padding: "14px 20px", gap: 16,
                      borderBottom: i < cat.items.length - 1 ? "1px solid #0C1018" : "none",
                      alignItems: "flex-start",
                    }}>
                      <div>
                        <div style={{ fontSize: 13, color: "#C8D0DC", fontWeight: 500, marginBottom: 3 }}>{item.name}</div>
                      </div>
                      <div style={{ fontSize: 12, color: "#4A5878", lineHeight: 1.6 }}>{item.why}</div>
                      <div>
                        <span style={{
                          fontSize: 10, padding: "3px 7px", borderRadius: 4,
                          background: item.learn.includes("Already") ? "#00E5A015" : "#818CF815",
                          color: item.learn.includes("Already") ? "#00E5A0" : "#818CF8",
                          border: `1px solid ${item.learn.includes("Already") ? "#00E5A030" : "#818CF830"}`,
                          whiteSpace: "nowrap",
                        }}>
                          {item.learn}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Learning order */}
            <div style={{ marginTop: 24, background: "#0D1018", border: "1px solid #10131A", borderRadius: 10, padding: "20px 22px" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#2E3848", marginBottom: 16, textTransform: "uppercase" }}>Recommended learning order (you're a React dev)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                {[
                  { order: "1", label: "TypeScript basics", time: "1 week", note: "Foundation for everything" },
                  { order: "2", label: "commander + @inquirer", time: "2 days", note: "CLI argument parsing" },
                  { order: "3", label: "handlebars + fs-extra", time: "2 days", note: "Template generation engine" },
                  { order: "4", label: "execa", time: "1 day", note: "Run shell commands" },
                  { order: "5", label: "npm publish workflow", time: "1 day", note: "Ship your CLI to npm" },
                  { order: "6", label: "Prisma + Neon Postgres", time: "1 week", note: "First database work" },
                  { order: "7", label: "Hono.js API", time: "1 week", note: "Your backend layer" },
                  { order: "8", label: "Clerk auth", time: "1 day", note: "Never build auth yourself" },
                  { order: "9", label: "Cloudflare R2", time: "1 day", note: "File storage" },
                  { order: "10", label: "Stripe subscriptions", time: "3 days", note: "Get paid" },
                  { order: "11", label: "Claude API", time: "2 days", note: "AI features" },
                  { order: "12", label: "Trigger.dev jobs", time: "3 days", note: "Background processing" },
                ].map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: "#0A1020", border: "1px solid #1E2530",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, color: "#00E5A0", flexShrink: 0,
                    }}>{step.order}</span>
                    <div>
                      <div style={{ fontSize: 12, color: "#8898AA" }}>{step.label}</div>
                      <div style={{ fontSize: 10, color: "#2E3848" }}>{step.time} · {step.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FIRST 30 DAYS TAB ──────────────────────────── */}
        {activeTab === "day1" && (
          <div className="ani">
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 20, fontWeight: 700, color: "#E8EDF5", marginBottom: 6 }}>
                Your First 30 Days — Exactly What To Build
              </h2>
              <p style={{ color: "#3A4860", fontSize: 12, lineHeight: 1.7 }}>
                You're a React developer. You don't need to know everything. You need to know the next step. This is it.
              </p>
            </div>

            <div style={{ border: "1px solid #10131A", borderRadius: 10, overflow: "hidden" }}>
              {FIRST_30_DAYS.map((day, i) => {
                const typeC = {
                  setup: "#00E5A0", code: "#818CF8", template: "#F97316",
                  test: "#FBBF24", infra: "#34D399", docs: "#F472B6", launch: "#A78BFA"
                };
                const c = typeC[day.type] || "#888";
                return (
                  <div key={i} className="day-row" style={{
                    display: "grid", gridTemplateColumns: "110px 160px 1fr",
                    padding: "14px 20px", gap: 16,
                    borderBottom: i < FIRST_30_DAYS.length - 1 ? "1px solid #0C1018" : "none",
                    alignItems: "flex-start",
                  }}>
                    <div>
                      <span style={{ fontSize: 10, color: "#2E3848", letterSpacing: "0.08em" }}>{day.day}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "#C8D0DC", fontWeight: 500, marginBottom: 4 }}>{day.task}</div>
                      <TAG label={day.type.toUpperCase()} color={c} />
                    </div>
                    <div style={{ fontSize: 12, color: "#4A5878", lineHeight: 1.65 }}>{day.detail}</div>
                  </div>
                );
              })}
            </div>

            {/* The honest advice section */}
            <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                {
                  title: "The one mistake to avoid",
                  color: "#F97316",
                  content: "Do not build the registry, the dashboard, or the AI features before v1.0. Ship the CLI first. Get 100 developers using it. Only then build what they ask for. Features nobody uses are features you wasted months on.",
                },
                {
                  title: "The unfair advantage you have",
                  color: "#00E5A0",
                  content: "You know React. The dashboard (@appinit/ui) — the product that makes agencies pay $199/mo — is a Next.js application. You can build that better than a backend-first developer. The CLI is 4 weeks of TypeScript. You have more leverage than you think.",
                },
                {
                  title: "Where to find early users",
                  color: "#818CF8",
                  content: "Dev.to article: 'I built a CLI that scaffolds Next.js in 10 seconds.' r/webdev, r/reactjs on Reddit. Twitter/X with a 30-second screen recording. GitHub trending. One ProductHunt launch after v1.0. Discord servers: Theo's T3, Syntax FM, Next.js Discord.",
                },
                {
                  title: "When to stop being solo",
                  color: "#FBBF24",
                  content: "Hire when you have $3k MRR and a feature that requires expertise you genuinely don't have. For AppInit that's the backend for the registry (v1.2.0). Before that, the CLI and a basic Next.js dashboard is 100% within your skillset as a React developer.",
                },
              ].map((card, i) => (
                <div key={i} style={{
                  background: "#0D1018", border: `1px solid ${card.color}20`,
                  borderTop: `2px solid ${card.color}`,
                  borderRadius: 8, padding: "16px 18px",
                }}>
                  <div style={{ fontSize: 11, color: card.color, marginBottom: 10, fontWeight: 600 }}>{card.title}</div>
                  <p style={{ fontSize: 12, color: "#4A5878", lineHeight: 1.7 }}>{card.content}</p>
                </div>
              ))}
            </div>

            {/* The first command */}
            <div style={{ marginTop: 20, background: "#060810", border: "1px solid #10181F", borderRadius: 10, padding: "20px 24px" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#2E3848", marginBottom: 14, textTransform: "uppercase" }}>
                The first command you run tomorrow morning
              </div>
              <div style={{ fontFamily: "inherit", fontSize: 13, lineHeight: 2, color: "#5A8060" }}>
                <div><span style={{ color: "#2E3848" }}># 1. Create your monorepo</span></div>
                <div><span style={{ color: "#00E5A0" }}>mkdir</span> <span style={{ color: "#8898AA" }}>appinit && cd appinit</span></div>
                <div><span style={{ color: "#00E5A0" }}>npm init</span> <span style={{ color: "#8898AA" }}>-y</span></div>
                <div><span style={{ color: "#00E5A0" }}>mkdir</span> <span style={{ color: "#8898AA" }}>packages && mkdir packages/cli</span></div>
                <div>&nbsp;</div>
                <div><span style={{ color: "#2E3848" }}># 2. Initialize the CLI package</span></div>
                <div><span style={{ color: "#00E5A0" }}>cd</span> <span style={{ color: "#8898AA" }}>packages/cli && npm init -y</span></div>
                <div><span style={{ color: "#00E5A0" }}>npm install</span> <span style={{ color: "#8898AA" }}>typescript commander chalk ora fs-extra handlebars</span></div>
                <div><span style={{ color: "#00E5A0" }}>npm install -D</span> <span style={{ color: "#8898AA" }}>@types/node vitest tsx</span></div>
                <div>&nbsp;</div>
                <div><span style={{ color: "#2E3848" }}># 3. Write your first 20 lines in src/index.ts</span></div>
                <div><span style={{ color: "#2E3848" }}># 4. Run: npx tsx src/index.ts new my-app</span></div>
                <div><span style={{ color: "#2E3848" }}># 5. See a project appear. That's your v0.1.0.</span></div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <div style={{ borderTop: "1px solid #0C0F14", padding: "20px 28px", marginTop: 20 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 10, color: "#1E2530", letterSpacing: "0.1em" }}>APPINIT · 10-YEAR BLUEPRINT · v0.1 → v8.0</span>
          <span style={{ fontSize: 10, color: "#1E2530" }}>{YEARS.reduce((a, y) => a + y.releases.length, 0)} releases · {YEARS.length} years · built by a React developer</span>
        </div>
      </div>
    </div>
  );
}
