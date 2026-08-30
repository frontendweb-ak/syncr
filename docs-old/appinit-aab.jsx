import { useState } from "react";

const AAB_DATA = {
  meta: {
    name: "AppInit Architecture Blueprint",
    version: "AAB v1.0",
    tagline: "The Universal Development Operating System",
    subtitle: "Every subsystem. Every module. Every feature. Defined.",
  },
  pillars: [
    { id: "cli", label: "@appinit/cli", icon: "⌨", color: "#00FFB2" },
    { id: "engine", label: "@appinit/engine", icon: "⚙", color: "#FF6B35" },
    { id: "ui", label: "@appinit/ui", icon: "◻", color: "#A78BFA" },
    { id: "registry", label: "@appinit/registry", icon: "◈", color: "#38BDF8" },
    { id: "ai", label: "@appinit/ai", icon: "◆", color: "#FB923C" },
    { id: "marketplace", label: "@appinit/marketplace", icon: "◎", color: "#4ADE80" },
    { id: "plugins", label: "@appinit/plugins", icon: "◐", color: "#F472B6" },
    { id: "cloud", label: "@appinit/cloud", icon: "◷", color: "#FCD34D" },
    { id: "analytics", label: "@appinit/analytics", icon: "◑", color: "#60A5FA" },
    { id: "devos", label: "@appinit/devos", icon: "⬡", color: "#E879F9" },
  ],
  modules: {
    cli: {
      title: "@appinit/cli",
      subtitle: "The Developer's Primary Interface",
      color: "#00FFB2",
      description: "The core command-line interface that powers every interaction. It's the entry point for project generation, component management, registry access, and AI assistance — all from the terminal.",
      modules: [
        {
          name: "Project Scaffolding Engine",
          tag: "CORE",
          features: [
            "appinit new [project-name] — interactive prompt-driven setup",
            "appinit new --template=next-prisma-clerk [name] — zero-prompt mode",
            "appinit new --config=.appinit.json — file-driven scaffold",
            "Dry-run mode: preview file tree before generation",
            "Conflict detection on existing directories",
            "Post-scaffold hooks (npm install, git init, first commit)",
            "Monorepo-aware scaffolding (Turborepo / Nx integration)",
          ],
        },
        {
          name: "Template & Config Management",
          tag: "CORE",
          features: [
            "appinit template list — browse all available templates",
            "appinit template pull [id] — fetch from registry or marketplace",
            "appinit template publish — push custom template to registry",
            "appinit config init — generate .appinit.json interactively",
            "appinit config validate — lint and validate config against schema",
            "appinit config diff — compare local config against template defaults",
            "Local config override with inheritance merging",
          ],
        },
        {
          name: "Component CLI",
          tag: "AGENCY",
          features: [
            "appinit component add [name] — scaffold a new component",
            "appinit component push [name] — push to private registry",
            "appinit component pull [name] — pull from registry into project",
            "appinit component sync — sync all stale registry components",
            "appinit component diff [name] — compare local vs registry version",
            "appinit component deprecate [name] — mark as deprecated",
            "appinit component list --outdated — surface all stale components",
          ],
        },
        {
          name: "Project Lifecycle Commands",
          tag: "DEVOS",
          features: [
            "appinit doctor — health check on generated project",
            "appinit upgrade — apply template patch to existing project",
            "appinit audit — security & dependency vulnerability scan",
            "appinit migrate [target-template] — migrate project to new template",
            "appinit snapshot — capture current state for rollback",
            "appinit restore [snapshot-id] — rollback to a snapshot",
            "appinit env — manage .env across environments with encryption",
          ],
        },
        {
          name: "AI-Assisted CLI",
          tag: "AI",
          features: [
            "appinit ai ask [prompt] — natural language DevOS assistant",
            "appinit ai generate component [description] — text to component code",
            "appinit ai fix [error] — paste stack trace, get fix suggestion",
            "appinit ai docs [component] — auto-generate docs for a file",
            "appinit ai refactor [file] — suggest and apply refactors",
            "appinit ai explain [file] — explain architecture decisions",
            "Streaming output mode for long-running AI commands",
          ],
        },
        {
          name: "Auth & Registry Access",
          tag: "INFRA",
          features: [
            "appinit login — OAuth or API key authentication",
            "appinit logout / appinit whoami",
            "appinit org switch [org-id] — multi-org context switching",
            "appinit registry connect [url] — link to private enterprise registry",
            "appinit token generate — create scoped API tokens",
            "Credential storage via OS keychain (not .env)",
            "SSO/SAML support for enterprise orgs",
          ],
        },
      ],
    },
    engine: {
      title: "@appinit/engine",
      subtitle: "The Execution & Orchestration Core",
      color: "#FF6B35",
      description: "The server-side brain. It processes template logic, resolves dependency graphs, executes scaffold generation, manages versioning, and serves as the API backbone for all clients (CLI, UI, AI).",
      modules: [
        {
          name: "Template Execution Runtime",
          tag: "CORE",
          features: [
            "Template definition schema (JSON/YAML based DSL)",
            "Conditional file inclusion engine (if-feature-auth: include /auth/*)",
            "Variable interpolation and token replacement engine",
            "Template composition: extend base templates with overlays",
            "Pre/post generation hook system (scripts, npm commands)",
            "File conflict resolution strategies (overwrite/merge/skip)",
            "Cross-OS path normalization and file permission handling",
          ],
        },
        {
          name: "Template Version Control",
          tag: "CORE",
          features: [
            "Semantic versioning for all templates (semver)",
            "Changelog tracking per template version",
            "Dependency locking (template → package version matrix)",
            "LTS (Long-Term Support) designation for stable templates",
            "Deprecation lifecycle with sunset dates",
            "Automated breaking change detection between versions",
            "Template diff engine: what changed between v1.2 and v2.0",
          ],
        },
        {
          name: "Dependency Graph Resolver",
          tag: "CORE",
          features: [
            "Resolves feature → package dependency trees",
            "Conflict detection between selected features",
            "Auto-selects compatible package versions",
            "Peer dependency warnings and auto-resolution",
            "Optional vs required dependency classification",
            "Lockfile generation for reproducible scaffolds",
            "Security advisory checks against known CVE databases",
          ],
        },
        {
          name: "Project State Manager",
          tag: "AGENCY",
          features: [
            "Project metadata store (name, template, version, org, tags)",
            "Project lineage tracking (forked from which template/version)",
            "Change history log per project",
            "Cross-project relationship mapping (parent/child projects)",
            "Sync state tracking (what's in sync with registry)",
            "Project tagging and categorization system",
            "Archive/restore/delete project workflows",
          ],
        },
        {
          name: "API Gateway",
          tag: "INFRA",
          features: [
            "REST API (OpenAPI 3.1 spec) for all CLI + UI operations",
            "GraphQL API for complex, relational queries (projects, orgs, components)",
            "WebSocket support for real-time scaffold progress streaming",
            "API key + JWT authentication middleware",
            "Rate limiting and abuse prevention per org/user tier",
            "Request/response audit logging",
            "SDK generation: auto-publish TypeScript + Python client SDKs",
          ],
        },
        {
          name: "Event Bus & Webhooks",
          tag: "DEVOS",
          features: [
            "Internal event bus (project.created, component.pushed, sync.triggered)",
            "Outbound webhooks to external systems (Slack, JIRA, GitHub)",
            "Event replay for debugging and audit",
            "Retry logic with exponential backoff",
            "Event schema registry and versioning",
            "Dead letter queue for failed webhooks",
            "Webhook signature verification (HMAC)",
          ],
        },
      ],
    },
    ui: {
      title: "@appinit/ui",
      subtitle: "The Visual Configuration Dashboard",
      color: "#A78BFA",
      description: "A web-based interface for teams and non-CLI users. It allows visual project configuration, component browsing, team management, analytics, and AI assistant interactions without touching the terminal.",
      modules: [
        {
          name: "Project Creation Wizard",
          tag: "CORE",
          features: [
            "Step-by-step visual framework/template selector",
            "Live dependency preview as features are toggled",
            "Real-time file tree preview before scaffold",
            "One-click scaffold + deploy to GitHub + Vercel",
            "Config file export (.appinit.json) for CLI-based teams",
            "Template comparison side-by-side view",
            "'Start from Existing Project' reverse-engineering mode",
          ],
        },
        {
          name: "Organization Dashboard",
          tag: "AGENCY",
          features: [
            "Projects overview: all org projects with health indicators",
            "Team member management (invite, roles, permissions)",
            "Registry overview: all components, versions, usage stats",
            "Billing and subscription management panel",
            "Activity feed: recent scaffolds, pushes, syncs",
            "Org-wide template usage statistics",
            "Client workspace separation (agency → client sub-orgs)",
          ],
        },
        {
          name: "Component Registry Explorer",
          tag: "AGENCY",
          features: [
            "Visual component browser with live preview (iframe sandbox)",
            "Version history timeline with visual diffs",
            "One-click pull component into any project",
            "Usage tracking: which projects use which components",
            "Approval workflow UI for component updates",
            "Component health score (docs coverage, test coverage, age)",
            "Dependency graph visualization for complex components",
          ],
        },
        {
          name: "AI Assistant Interface",
          tag: "AI",
          features: [
            "Chat-based AI assistant (context-aware of current org/project)",
            "Text → Config generation with live preview",
            "Paste stack trace → get fix suggestion workflow",
            "AI-generated component previewer",
            "Prompt history and saved prompt library",
            "AI usage dashboard (tokens used, cost per month)",
            "Team-shared AI prompt templates",
          ],
        },
        {
          name: "Template & Marketplace Browser",
          tag: "MARKETPLACE",
          features: [
            "Browse public + private templates with filters (framework, use-case, rating)",
            "Template detail page: features, changelog, author, pricing",
            "One-click template purchase and license management",
            "Seller dashboard for template authors",
            "Review and rating system",
            "Template request board (vote for new templates)",
            "Featured and trending sections",
          ],
        },
        {
          name: "Monitoring & Alerts Console",
          tag: "DEVOS",
          features: [
            "Dependency vulnerability alerts dashboard (CVE feed per project)",
            "Template update notifications with changelog summaries",
            "Sync status board: which projects are out of sync",
            "CI/CD pipeline status embedded per project",
            "Scheduled audit reports (weekly email summaries)",
            "Custom alert rule builder (e.g., alert if lodash < 4.17.21)",
            "Incident log and resolution history",
          ],
        },
      ],
    },
    registry: {
      title: "@appinit/registry",
      subtitle: "The Centralized Component & Template Store",
      color: "#38BDF8",
      description: "The heart of agency reusability. A versioned, private/public registry for components, templates, and integrations. Think npm for your organization's own design system and logic layers.",
      modules: [
        {
          name: "Component Storage Layer",
          tag: "CORE",
          features: [
            "Push/pull API for React, Vue, Svelte components",
            "Multi-framework component bundles (one push, all framework versions)",
            "Binary asset support (images, fonts, SVGs linked to components)",
            "Component metadata schema (name, framework, tags, author, license)",
            "Full git-style versioning with tag and branch support",
            "Component dependency declaration (what packages it needs)",
            "Private (org-only) and public (marketplace) visibility modes",
          ],
        },
        {
          name: "Template Registry",
          tag: "CORE",
          features: [
            "Full project template storage and versioning",
            "Template inheritance tree (base → extended → customized)",
            "Diff-patch distribution (only ship what changed, not full template)",
            "Template signing and verification (author integrity)",
            "Official vs Community vs Partner template classification",
            "Template test suite runner (CI ensures scaffold builds and runs)",
            "Immutable release publishing (no overwriting released versions)",
          ],
        },
        {
          name: "Cross-Project Sync Engine",
          tag: "AGENCY",
          features: [
            "Registry → project sync state computation",
            "Automatic PR generation when registry component is updated",
            "Approval workflows: require review before auto-merge",
            "Conflict detection when local changes clash with registry update",
            "Selective sync: choose which components to keep in sync",
            "Bulk sync operations across all org projects",
            "Rollback: revert a component to a previous registry version",
          ],
        },
        {
          name: "Access Control & Security",
          tag: "INFRA",
          features: [
            "Role-based access control (RBAC): owner, editor, viewer",
            "Package signing with private keys (author verification)",
            "Token-scoped access (read-only, publish, admin)",
            "IP allowlisting for enterprise registry access",
            "Audit log: every push, pull, delete with timestamp + actor",
            "SBOM (Software Bill of Materials) export per component",
            "SOC2-compliant storage and encryption at rest",
          ],
        },
        {
          name: "Registry Analytics",
          tag: "ANALYTICS",
          features: [
            "Component download/pull counts per version",
            "Usage heatmap: most used components across all projects",
            "Stale component detection (not pulled in 90+ days)",
            "Component author leaderboard and contribution stats",
            "Bandwidth and storage consumption per org",
            "Adoption tracking: how fast new versions are adopted",
            "Deprecation impact analysis (how many projects are affected)",
          ],
        },
        {
          name: "Federation & Enterprise",
          tag: "ENTERPRISE",
          features: [
            "Multi-registry federation (connect multiple private registries)",
            "Cross-org component sharing with permission grants",
            "Self-hosted registry deployment option (Docker/K8s)",
            "LDAP/SAML integration for enterprise auth",
            "On-premise air-gapped registry for security-sensitive orgs",
            "Registry mirroring for high-availability setups",
            "SLA-backed uptime guarantees for enterprise tier",
          ],
        },
      ],
    },
    ai: {
      title: "@appinit/ai",
      subtitle: "The Intelligent Development Automation Layer",
      color: "#FB923C",
      description: "AI is not a feature — it's a layer embedded throughout AppInit. From config generation to automated PRs, the AI subsystem turns AppInit into a proactive development partner that thinks ahead.",
      modules: [
        {
          name: "AI Setup Assistant",
          tag: "CORE",
          features: [
            "Natural language → .appinit.json config generation",
            "Intent disambiguation (asks clarifying questions before generating)",
            "Multi-turn conversation to refine configuration iteratively",
            "Architecture recommendation engine (suggests best template for need)",
            "Constraint-aware suggestions (budget, team size, timeline)",
            "Output: config file + explanation of every choice made",
            "Integration with appinit config validate for instant feedback",
          ],
        },
        {
          name: "AI Component Generator",
          tag: "AGENCY",
          features: [
            "Text prompt → production-ready React/Vue/Svelte component",
            "Generates component + test file + Storybook story in one call",
            "Design system-aware generation (respects org's Tailwind config)",
            "Iterative refinement: 'make it responsive' or 'add dark mode'",
            "Accessibility-first generation (WCAG 2.1 compliant output)",
            "Framework-consistent code style (follows ESLint/Prettier config)",
            "One-click push generated component to registry",
          ],
        },
        {
          name: "AI Documentation Engine",
          tag: "AGENCY",
          features: [
            "Auto-generates JSDoc/TSDoc from component source code",
            "Produces README.md per component with usage examples",
            "Storybook story auto-generation with prop variations",
            "API documentation generation for backend routes",
            "Changelog entry generation from git diff",
            "Architecture Decision Record (ADR) drafting from code context",
            "Continuous doc sync: re-generates docs on component update",
          ],
        },
        {
          name: "AI Dependency Watcher",
          tag: "DEVOS",
          features: [
            "Monitors npm/PyPI advisory feeds for CVE alerts",
            "Maps CVEs to specific projects using affected package",
            "Severity-tiered alerts (Critical/High/Medium/Low)",
            "Auto-generates upgrade PR with patch + test run results",
            "Tracks compatibility risk of upgrades (breaking change analysis)",
            "Monthly automated dependency health reports",
            "SLA alerting: critical CVEs notified within 1 hour",
          ],
        },
        {
          name: "AI Sync Proposer",
          tag: "ENTERPRISE",
          features: [
            "Detects when a registry component is updated",
            "Automatically opens a PR in every dependent project",
            "PR includes: diff, impact analysis, test results, rollback instructions",
            "Approval workflow: team lead approves before auto-merge",
            "Conflict resolution assistant (AI suggests merge strategy)",
            "Batch PR management: approve/reject across all projects at once",
            "Audit trail: who approved what sync, and when",
          ],
        },
        {
          name: "AI Migration Agent",
          tag: "ENTERPRISE",
          features: [
            "Analyzes legacy codebase (CRA, plain Express, jQuery) and maps to AppInit template",
            "Generates step-by-step migration plan with risk scoring",
            "Automated code transformation where possible (AST-based rewrites)",
            "Creates AppInit config for migrated project",
            "Identifies manual migration steps with clear instructions",
            "Test coverage gap analysis post-migration",
            "Migration progress dashboard with rollback checkpoints",
          ],
        },
        {
          name: "AI Debugger",
          tag: "DEVOS",
          features: [
            "Paste stack trace → root cause analysis + fix suggestion",
            "Template-aware debugging (knows the architecture of your scaffold)",
            "Common error pattern library per framework/template",
            "Suggested fix includes code snippet + explanation",
            "Integration with GitHub Issues: auto-open issue with AI analysis",
            "Recurring error tracking: detect patterns across team",
            "Performance bottleneck analysis from profiler output",
          ],
        },
      ],
    },
    marketplace: {
      title: "@appinit/marketplace",
      subtitle: "The Developer Economy Platform",
      color: "#4ADE80",
      description: "A multi-sided marketplace where developers, agencies, and SaaS companies earn money by creating and selling templates, components, plugins, and integrations. AppInit becomes a platform economy.",
      modules: [
        {
          name: "Component Block Store",
          tag: "CORE",
          features: [
            "Pre-built, production-ready UI blocks (Stripe Checkout, Auth Forms, Dashboards)",
            "Multi-framework variants (React + Vue + Svelte versions of same block)",
            "Live preview sandbox before purchase",
            "One-time purchase or subscription licensing models",
            "Buyer reviews and star ratings",
            "Refund policy and dispute resolution system",
            "Volume licensing for agencies (buy once, use on all client projects)",
          ],
        },
        {
          name: "Premium Template Store",
          tag: "CORE",
          features: [
            "Specialized full-stack templates (SaaS, HIPAA, Web3, E-commerce, etc.)",
            "Tiered pricing by complexity (Basic / Pro / Enterprise templates)",
            "Template license types (personal, commercial, unlimited)",
            "Template author certification program (quality assurance)",
            "Free trial mode: scaffold with watermarks, pay to unlock",
            "Bundle deals: buy 3 templates, get 1 free",
            "Template update policy: buyer gets X major versions included",
          ],
        },
        {
          name: "Backend Plugin Marketplace",
          tag: "AGENCY",
          features: [
            "Pre-wired service integrations (Stripe, Mailchimp, Twilio, SendGrid, etc.)",
            "Drop-in Prisma schema extensions (SaaS billing, multi-tenancy, etc.)",
            "Authentication provider plugins (Clerk, Auth0, Supabase)",
            "Infrastructure plugins (AWS S3 setup, Cloudflare Workers, Upstash Redis)",
            "Subscription share model: earn recurring % from integrated SaaS sign-ups",
            "Plugin compatibility matrix (which templates each plugin supports)",
            "Official partner plugins (maintained by the SaaS company itself)",
          ],
        },
        {
          name: "Seller Platform",
          tag: "MARKETPLACE",
          features: [
            "Seller onboarding and verification flow",
            "Template/component upload, versioning, and publishing workflow",
            "Seller analytics: revenue, downloads, ratings, churn",
            "Payout management (Stripe Connect integration)",
            "Revenue sharing model (seller: 70-85%, AppInit: 15-30%)",
            "Seller tier system (Verified, Partner, Certified) with increasing rev share",
            "DMCA takedown and IP dispute resolution system",
          ],
        },
        {
          name: "Discovery & Search",
          tag: "MARKETPLACE",
          features: [
            "Semantic search (find templates by describing the app, not keywords)",
            "Filter by: framework, use-case, price, rating, license, maintained status",
            "AI-powered recommendation engine (based on your project history)",
            "Collections: curated bundles (e.g., 'Best SaaS Starters 2025')",
            "Trending and new releases sections",
            "Framework compatibility filter (only show Vue-compatible items)",
            "'Used by X companies' social proof badges",
          ],
        },
        {
          name: "License & Compliance Engine",
          tag: "INFRA",
          features: [
            "License type definition (personal, commercial, SaaS, unlimited)",
            "License key generation and validation per purchase",
            "Usage tracking to enforce license limits",
            "License transfer between projects/orgs",
            "Automated DMCA compliance tooling",
            "OSS license compatibility checker (MIT/Apache/GPL conflicts)",
            "Compliance report export for enterprise legal teams",
          ],
        },
      ],
    },
    plugins: {
      title: "@appinit/plugins",
      subtitle: "The Extension & Integration SDK",
      color: "#F472B6",
      description: "A powerful SDK that allows any developer, tool vendor, or SaaS company to extend AppInit's capabilities — adding new commands, template hooks, UI panels, registry adapters, and AI integrations.",
      modules: [
        {
          name: "Plugin API Contract",
          tag: "CORE",
          features: [
            "Plugin manifest schema (appinit-plugin.json)",
            "Lifecycle hooks: onPreScaffold, onPostScaffold, onComponentPush",
            "CLI command extension API (add new appinit commands)",
            "Template transformer API (modify template output programmatically)",
            "UI panel injection API (add panels to @appinit/ui dashboard)",
            "Event subscription API (listen to engine events)",
            "Sandboxed execution environment for security isolation",
          ],
        },
        {
          name: "Template Plugin Layer",
          tag: "CORE",
          features: [
            "Custom template authoring guide and scaffold generator",
            "Template testing framework (scaffold + run + lint in CI)",
            "Template inheritance: extend an existing template cleanly",
            "Feature flag injection: add optional feature blocs to existing templates",
            "Template preview server (local iframe preview before publishing)",
            "Cross-template feature portability helpers",
            "Official template certification pipeline for marketplace",
          ],
        },
        {
          name: "Third-Party Integrations Layer",
          tag: "INTEGRATIONS",
          features: [
            "GitHub App integration (auto-create repo, branches, Actions on scaffold)",
            "GitLab / Bitbucket parity integrations",
            "JIRA plugin: auto-create project board from scaffolded feature list",
            "Slack plugin: notify team on scaffold, sync, CVE alert events",
            "Linear plugin: task generation from template feature list",
            "Figma plugin: match component names between design tokens and code",
            "VS Code extension: AppInit sidebar for component + template actions",
          ],
        },
        {
          name: "CI/CD Plugin System",
          tag: "DEVOS",
          features: [
            "GitHub Actions workflow generator per template",
            "GitLab CI/CD pipeline generator",
            "CircleCI / Jenkins config plugins",
            "Deployment target plugins: Vercel, Netlify, AWS, Railway, Fly.io",
            "Container plugins: Docker + Kubernetes manifest generation",
            "Secret management: GitHub Secrets / Vault / Doppler integration",
            "Multi-environment config management (dev/staging/prod)",
          ],
        },
        {
          name: "Registry Adapter Protocol",
          tag: "ENTERPRISE",
          features: [
            "Custom storage backend adapter (S3, GCS, Azure Blob)",
            "Private npm / Verdaccio registry bridging",
            "Artifactory integration for enterprise artifact management",
            "Custom auth adapter (LDAP, Okta, Azure AD)",
            "Import adapter: migrate existing component library into AppInit registry",
            "Export adapter: publish registry components to external npm",
            "Multi-cloud redundancy configuration",
          ],
        },
        {
          name: "Plugin Marketplace SDK",
          tag: "MARKETPLACE",
          features: [
            "Plugin submission and review workflow",
            "Plugin versioning and changelog requirements",
            "SDK documentation generator",
            "Plugin test suite harness",
            "Local plugin development server with hot reload",
            "Plugin revenue sharing (if paid plugin)",
            "Usage analytics SDK for plugin authors",
          ],
        },
      ],
    },
    cloud: {
      title: "@appinit/cloud",
      subtitle: "The Managed Infrastructure & Hosting Layer",
      color: "#FCD34D",
      description: "A managed cloud offering that handles deployment, environment management, preview deployments, and infrastructure-as-code generation — so teams go from scaffold to live app in minutes.",
      modules: [
        {
          name: "One-Click Deployment",
          tag: "CORE",
          features: [
            "appinit deploy — detect framework, build, and deploy automatically",
            "Vercel / Netlify / Railway / Fly.io adapter support",
            "AWS Amplify / CloudFront deployment adapter",
            "Custom domain setup wizard (DNS + SSL automated)",
            "Environment variable management across deployments",
            "Build log streaming in real-time",
            "Rollback to any previous deployment with one command",
          ],
        },
        {
          name: "Preview Environments",
          tag: "AGENCY",
          features: [
            "Automatic preview URL per pull request",
            "Isolated database per preview environment (ephemeral Postgres, etc.)",
            "Preview environment expiry and cleanup automation",
            "Share preview link with clients — password protected",
            "Side-by-side comparison: production vs preview",
            "One-click promote: preview → production",
            "Preview environment cost controls and limits",
          ],
        },
        {
          name: "Infrastructure as Code Generator",
          tag: "DEVOS",
          features: [
            "Generate Terraform / Pulumi scripts from scaffold config",
            "AWS CDK app generation from template definition",
            "Docker Compose + Dockerfile generation per template",
            "Kubernetes manifest generation (Deployment, Service, Ingress)",
            "Helm chart generation for complex multi-service templates",
            "Cost estimation: preview monthly cloud spend before deploy",
            "IaC diff: detect infrastructure drift from defined spec",
          ],
        },
        {
          name: "Secrets & Environment Management",
          tag: "INFRA",
          features: [
            "Centralized .env management across all org projects",
            "Secret rotation automation (JWT secrets, DB passwords)",
            "Integration with Doppler, 1Password, AWS Secrets Manager, Vault",
            "Per-environment secret isolation (dev ≠ staging ≠ prod)",
            "Secret usage audit log",
            "Leaked secret detection in codebase (pre-commit hooks)",
            "RBAC for secret access by team role",
          ],
        },
        {
          name: "Monitoring & Observability",
          tag: "DEVOS",
          features: [
            "Error tracking integration (Sentry auto-configured per template)",
            "Performance monitoring (Datadog / New Relic setup)",
            "Log aggregation (Logtail / Papertrail / Axiom integration)",
            "Uptime monitoring with alerting (PagerDuty / Opsgenie)",
            "Core Web Vitals tracking per deployment",
            "Database query performance monitoring",
            "AppInit health score per deployed project",
          ],
        },
        {
          name: "Multi-Tenant Client Management",
          tag: "ENTERPRISE",
          features: [
            "Agency → client project isolation and access control",
            "Per-client resource quotas (compute, storage, API calls)",
            "Client-facing project status portal (white-labelled)",
            "Consolidated billing: one invoice for all client environments",
            "Cross-client deployment orchestration",
            "Client offboarding workflow (export + handover package)",
            "SLA monitoring per client with breach alerting",
          ],
        },
      ],
    },
    analytics: {
      title: "@appinit/analytics",
      subtitle: "Platform Intelligence & Developer Insights",
      color: "#60A5FA",
      description: "Deep analytics for developers, agencies, and the AppInit platform itself. Understand how teams build, what they reuse, where they slow down, and how the ecosystem grows.",
      modules: [
        {
          name: "Developer Productivity Analytics",
          tag: "CORE",
          features: [
            "Time-to-first-deploy tracking per project",
            "Setup time saved vs manual baseline (hours/cost saved dashboard)",
            "Template adoption velocity per developer/team",
            "Component reuse rate: % of project using registry vs custom code",
            "Developer activity heatmaps (scaffold/push/pull patterns)",
            "Onboarding funnel: time from signup to first scaffold",
            "Cohort analysis: retention of developers by signup month",
          ],
        },
        {
          name: "Org & Agency Analytics",
          tag: "AGENCY",
          features: [
            "Portfolio overview: all client projects, health scores, last activity",
            "Component ROI: hours saved by reusing registry components",
            "Template consistency score: % of projects on latest template version",
            "Vulnerability exposure dashboard: unpatched CVEs across portfolio",
            "Team contribution analytics: who pushed what, when",
            "Project delivery time trends (did AppInit speed up launches?)",
            "Monthly automated savings report (send to agency leadership)",
          ],
        },
        {
          name: "Marketplace Analytics",
          tag: "MARKETPLACE",
          features: [
            "Template/component view → purchase conversion funnels",
            "Revenue analytics per seller (daily, weekly, monthly, LTV)",
            "Chargeback and refund rate tracking",
            "Search query analysis (what are developers looking for?)",
            "Demand gap analysis: frequently searched, not found",
            "Seller performance benchmarking (your rank vs category average)",
            "Geographic revenue breakdown",
          ],
        },
        {
          name: "Platform Health Metrics",
          tag: "INFRA",
          features: [
            "API latency and error rate dashboards",
            "Registry storage growth and bandwidth trends",
            "AI feature usage and cost per operation",
            "Feature adoption funnel (what % of users use AI features?)",
            "Subscription upgrade/downgrade/churn tracking",
            "Support ticket volume correlated with feature releases",
            "NPS (Net Promoter Score) collection and trending",
          ],
        },
        {
          name: "Ecosystem Intelligence",
          tag: "DEVOS",
          features: [
            "Most popular frameworks/stacks in the ecosystem",
            "Technology trend tracking (which packages are rising/falling)",
            "Security posture report: ecosystem-wide CVE exposure",
            "Community contribution health (templates, plugins, marketplace)",
            "Competitive benchmarking (AppInit vs alternative tools)",
            "Developer community growth metrics",
            "Open source contribution tracking (PR, Issues, Stars)",
          ],
        },
      ],
    },
    devos: {
      title: "@appinit/devos",
      subtitle: "The Continuous Development Operating System",
      color: "#E879F9",
      description: "The meta-layer that transforms AppInit from a generator into a living Development OS. It handles continuous maintenance, governance, team workflows, and the intelligence that keeps every project current, secure, and consistent — forever.",
      modules: [
        {
          name: "Continuous Maintenance Engine",
          tag: "CORE",
          features: [
            "Scheduled dependency health scans (daily/weekly per org setting)",
            "Automated PR generation for dependency patches",
            "Template version adoption tracking and migration nudges",
            "Dead code detection and cleanup suggestions",
            "Bundle size monitoring with regression alerts",
            "Automated test coverage reporting per project",
            "Technical debt scoring dashboard",
          ],
        },
        {
          name: "Governance & Compliance Layer",
          tag: "ENTERPRISE",
          features: [
            "Policy as Code: define org-wide rules (no lodash < 4.17, always use TypeScript)",
            "Policy violation alerts and automated PRs to fix violations",
            "License compliance scanning across all projects",
            "GDPR/HIPAA compliance checklist generator per template",
            "Security posture scoring per project (A-F grade)",
            "CIS benchmark checks for deployed infrastructure",
            "Compliance audit report export (SOC2, ISO 27001 ready)",
          ],
        },
        {
          name: "Team Workflow Orchestration",
          tag: "AGENCY",
          features: [
            "Onboarding playbooks: new developer → productive in < 30 minutes",
            "Role-based workflow templates (junior dev, lead, architect)",
            "Branching strategy enforcement (Git Flow, trunk-based, etc.)",
            "Code review automation: AI-powered PR summarization",
            "Sprint template: scaffold → JIRA board → GitHub repo in one action",
            "Runbook generation per project (how to deploy, rollback, debug)",
            "Knowledge base auto-population from code activity",
          ],
        },
        {
          name: "AppInit OS Package System",
          tag: "DEVOS",
          features: [
            "appinit os update — update AppInit CLI and all plugins",
            "Pinned versions per org (org controls which AppInit version teams use)",
            "Canary release channel for early adopters",
            "Rollback AppInit version if breaking change detected",
            "Plugin dependency resolution (plugins may depend on each other)",
            "Update impact preview: what will change if I update?",
            "Offline mode: work without internet (cached templates/registry)",
          ],
        },
        {
          name: "Developer Experience (DX) System",
          tag: "CORE",
          features: [
            "Interactive CLI with beautiful spinners, progress bars, and color themes",
            "Contextual help: appinit help [command] with examples",
            "Error messages with actionable fix suggestions (not just stack traces)",
            "Tab-completion for all commands and flags",
            "Shell integration: Zsh / Fish / Bash completion scripts",
            "DX telemetry: measure where developers get stuck (opt-in)",
            "Changelog notifications on CLI startup (what's new in this version)",
          ],
        },
        {
          name: "Monetization & Billing Engine",
          tag: "INFRA",
          features: [
            "Subscription tier management (Free / Pro / Agency / Enterprise)",
            "Usage-based billing for AI features (tokens used)",
            "Seat-based pricing for team plans",
            "Marketplace revenue collection and seller payout (Stripe Connect)",
            "Invoice generation and billing history",
            "Usage limit enforcement with grace periods",
            "Enterprise custom contracts and invoicing",
          ],
        },
      ],
    },
  },
};

const TAG_COLORS = {
  CORE: "#00FFB2",
  AGENCY: "#A78BFA",
  AI: "#FB923C",
  DEVOS: "#E879F9",
  INFRA: "#38BDF8",
  ENTERPRISE: "#FCD34D",
  MARKETPLACE: "#4ADE80",
  ANALYTICS: "#60A5FA",
  INTEGRATIONS: "#F472B6",
};

const PHASES = [
  {
    phase: "Phase 1",
    label: "MVP",
    months: "Months 1–4",
    color: "#00FFB2",
    goal: "Prove zero-config scaffolding. Ship @appinit/cli + Next.js/React/Node templates. 100 devs. 500 scaffolds.",
    pillars: ["cli", "engine"],
    revModel: "Free + Waitlist for Pro",
  },
  {
    phase: "Phase 2",
    label: "Agency Platform",
    months: "Months 5–10",
    color: "#A78BFA",
    goal: "Capture agency market. Launch registry, @appinit/ui, GitHub Actions, AI Setup Assistant. 5 paying orgs.",
    pillars: ["ui", "registry", "ai"],
    revModel: "$49/mo Pro · $199/mo Agency",
  },
  {
    phase: "Phase 3",
    label: "AI OS",
    months: "Months 11–18",
    color: "#FB923C",
    goal: "AI Automation layer. Component Marketplace. Monorepo. Svelte. AI Sync Proposer. 5 enterprise clients.",
    pillars: ["marketplace", "plugins"],
    revModel: "$499/mo Enterprise · Marketplace Fees",
  },
  {
    phase: "Phase 4",
    label: "Dev Economy",
    months: "Months 19–30",
    color: "#FCD34D",
    goal: "Full cloud offering. IaC generation. AI Migration Agent. Global marketplace economy. 100+ enterprise.",
    pillars: ["cloud", "analytics", "devos"],
    revModel: "Cloud Usage · Marketplace · Enterprise",
  },
];

const REVENUE_STREAMS = [
  { name: "Free / Open Source CLI", model: "Core templates free forever. Community goodwill + developer adoption funnel.", tier: "Free" },
  { name: "Pro Templates", model: "Advanced templates (Next + tRPC + Prisma + Clerk). $9/template or $49/mo Pro.", tier: "Pro" },
  { name: "Agency Subscription", model: "Private Component Registry + @appinit/ui + GitHub Actions. $199/mo per org.", tier: "Agency" },
  { name: "Enterprise Plan", model: "Multi-registry, AI Sync Proposer, SSO, SLA. $999+/mo custom contracts.", tier: "Enterprise" },
  { name: "Marketplace Commission", model: "15-30% of every template/component/plugin sale. Long-tail recurring revenue.", tier: "Marketplace" },
  { name: "AI Usage Credits", model: "Token-based billing for AI Component Generator, Doc Writer, Migration Agent.", tier: "AI" },
  { name: "Cloud Deployments", model: "Usage-based hosting revenue. Margin on compute + storage above infrastructure cost.", tier: "Cloud" },
  { name: "SaaS Partner Referrals", model: "Revenue share from Clerk, Supabase, Stripe sign-ups via AppInit plugins.", tier: "Partner" },
  { name: "Certification Program", model: "Certified Template Creator / Agency Partner certification. $299/year.", tier: "Program" },
  { name: "White-Label Licensing", model: "Large enterprises license AppInit engine under their own brand. $50k+/year.", tier: "Enterprise" },
];

export default function AppInitAAB() {
  const [activeModule, setActiveModule] = useState("cli");
  const [expandedFeature, setExpandedFeature] = useState(null);
  const [activeTab, setActiveTab] = useState("modules");

  const current = AAB_DATA.modules[activeModule];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080A0E",
      color: "#E8EAF0",
      fontFamily: "'DM Mono', 'Fira Code', 'Courier New', monospace",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0D0F14; }
        ::-webkit-scrollbar-thumb { background: #1E2530; border-radius: 2px; }
        .pillar-btn { transition: all 0.2s ease; cursor: pointer; }
        .pillar-btn:hover { transform: translateY(-2px); }
        .pillar-btn.active { transform: translateY(-2px); }
        .feature-item { transition: all 0.15s ease; }
        .feature-item:hover { background: rgba(255,255,255,0.04); }
        .tab-btn { transition: all 0.2s ease; cursor: pointer; }
        .tab-btn:hover { opacity: 0.8; }
        .rev-row:hover { background: rgba(255,255,255,0.03); }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes slide-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .slide-in { animation: slide-in 0.3s ease forwards; }
        .grid-bg {
          background-image: 
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>

      {/* HEADER */}
      <div className="grid-bg" style={{ borderBottom: "1px solid #1A1E28", padding: "48px 32px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: "#00FFB2",
              animation: "pulse-dot 2s infinite",
              boxShadow: "0 0 12px #00FFB2",
            }} />
            <span style={{ fontSize: 11, letterSpacing: "0.2em", color: "#666", textTransform: "uppercase" }}>
              {AAB_DATA.meta.version} · {AAB_DATA.pillars.length} Subsystems · {Object.values(AAB_DATA.modules).reduce((a, m) => a + m.modules.length, 0)} Modules · {Object.values(AAB_DATA.modules).reduce((a, m) => a + m.modules.reduce((b, mod) => b + mod.features.length, 0), 0)} Features
            </span>
          </div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(32px, 5vw, 64px)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            marginBottom: 16,
          }}>
            <span style={{ color: "#00FFB2" }}>@appinit</span>
            <br />
            <span style={{ color: "#E8EAF0" }}>Architecture</span>
            <br />
            <span style={{ color: "#333" }}>Blueprint</span>
          </h1>
          <p style={{ color: "#666", fontSize: 14, maxWidth: 480, lineHeight: 1.6 }}>
            Every major subsystem AppInit may ever contain. Defined module by module, feature by feature. The master blueprint for the Universal Development Operating System.
          </p>
        </div>
      </div>

      {/* TAB NAV */}
      <div style={{ borderBottom: "1px solid #1A1E28", padding: "0 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 0 }}>
          {["modules", "roadmap", "revenue"].map(tab => (
            <button
              key={tab}
              className="tab-btn"
              onClick={() => setActiveTab(tab)}
              style={{
                background: "none",
                border: "none",
                padding: "16px 20px",
                fontSize: 12,
                fontFamily: "inherit",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: activeTab === tab ? "#00FFB2" : "#444",
                borderBottom: activeTab === tab ? "2px solid #00FFB2" : "2px solid transparent",
                cursor: "pointer",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* MODULES TAB */}
      {activeTab === "modules" && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px" }}>
          {/* Pillar Selector */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
            gap: 8,
            marginBottom: 32,
          }}>
            {AAB_DATA.pillars.map(p => (
              <button
                key={p.id}
                className={`pillar-btn ${activeModule === p.id ? "active" : ""}`}
                onClick={() => { setActiveModule(p.id); setExpandedFeature(null); }}
                style={{
                  background: activeModule === p.id ? `${p.color}15` : "#0D0F14",
                  border: `1px solid ${activeModule === p.id ? p.color : "#1A1E28"}`,
                  borderRadius: 8,
                  padding: "12px 8px",
                  cursor: "pointer",
                  textAlign: "center",
                  fontFamily: "inherit",
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 4 }}>{p.icon}</div>
                <div style={{
                  fontSize: 9,
                  letterSpacing: "0.08em",
                  color: activeModule === p.id ? p.color : "#555",
                  lineHeight: 1.4,
                }}>
                  {p.label.replace("@appinit/", "")}
                </div>
              </button>
            ))}
          </div>

          {/* Module Detail */}
          {current && (
            <div className="slide-in" key={activeModule}>
              {/* Header */}
              <div style={{
                background: "#0D0F14",
                border: `1px solid ${current.color}30`,
                borderRadius: 12,
                padding: "24px 28px",
                marginBottom: 24,
                borderLeft: `3px solid ${current.color}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h2 style={{
                      fontFamily: "'Syne', sans-serif",
                      fontSize: 28,
                      fontWeight: 700,
                      color: current.color,
                      letterSpacing: "-0.01em",
                    }}>
                      {current.title}
                    </h2>
                    <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>{current.subtitle}</p>
                  </div>
                  <div style={{
                    background: `${current.color}10`,
                    border: `1px solid ${current.color}30`,
                    borderRadius: 6,
                    padding: "6px 12px",
                    fontSize: 11,
                    color: current.color,
                    letterSpacing: "0.1em",
                  }}>
                    {current.modules.length} MODULES · {current.modules.reduce((a, m) => a + m.features.length, 0)} FEATURES
                  </div>
                </div>
                <p style={{ color: "#666", fontSize: 13, marginTop: 16, lineHeight: 1.7, maxWidth: 700 }}>
                  {current.description}
                </p>
              </div>

              {/* Modules Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 16,
              }}>
                {current.modules.map((mod, mi) => (
                  <div
                    key={mi}
                    style={{
                      background: "#0D0F14",
                      border: "1px solid #1A1E28",
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    {/* Module Header */}
                    <div style={{
                      padding: "16px 18px 14px",
                      borderBottom: "1px solid #1A1E28",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                      <div>
                        <h3 style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#E8EAF0",
                          fontFamily: "inherit",
                          letterSpacing: "0.02em",
                        }}>
                          {mod.name}
                        </h3>
                      </div>
                      <span style={{
                        background: `${TAG_COLORS[mod.tag] || "#444"}18`,
                        border: `1px solid ${TAG_COLORS[mod.tag] || "#444"}40`,
                        color: TAG_COLORS[mod.tag] || "#888",
                        fontSize: 9,
                        letterSpacing: "0.15em",
                        padding: "3px 7px",
                        borderRadius: 4,
                        whiteSpace: "nowrap",
                      }}>
                        {mod.tag}
                      </span>
                    </div>
                    {/* Features */}
                    <div style={{ padding: "8px 0" }}>
                      {mod.features.map((feat, fi) => (
                        <div
                          key={fi}
                          className="feature-item"
                          style={{
                            padding: "7px 18px",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                            cursor: "default",
                          }}
                        >
                          <span style={{ color: current.color, fontSize: 10, marginTop: 3, flexShrink: 0 }}>▸</span>
                          <span style={{ fontSize: 12, color: "#8892A0", lineHeight: 1.5 }}>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ROADMAP TAB */}
      {activeTab === "roadmap" && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px" }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
              Phased Development Roadmap
            </h2>
            <p style={{ color: "#555", fontSize: 13 }}>From zero to Universal Development OS — 4 phases, 30 months.</p>
          </div>

          {/* Timeline */}
          <div style={{ position: "relative", marginBottom: 48 }}>
            <div style={{
              position: "absolute", left: 16, top: 24, bottom: 24,
              width: 1, background: "linear-gradient(to bottom, #00FFB2, #A78BFA, #FB923C, #FCD34D)",
            }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {PHASES.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 24, paddingLeft: 0, marginBottom: 24 }}>
                  <div style={{ flexShrink: 0, paddingTop: 16 }}>
                    <div style={{
                      width: 32, height: 32,
                      borderRadius: "50%",
                      background: `${p.color}20`,
                      border: `2px solid ${p.color}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, color: p.color,
                      position: "relative", zIndex: 1,
                    }}>
                      {i + 1}
                    </div>
                  </div>
                  <div style={{
                    flex: 1,
                    background: "#0D0F14",
                    border: `1px solid ${p.color}25`,
                    borderRadius: 10,
                    padding: 20,
                    borderLeft: `3px solid ${p.color}`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                      <div>
                        <span style={{ fontSize: 10, color: p.color, letterSpacing: "0.15em" }}>{p.phase} · {p.months}</span>
                        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: "#E8EAF0", marginTop: 2 }}>
                          {p.label}
                        </h3>
                      </div>
                      <span style={{
                        background: `${p.color}15`, border: `1px solid ${p.color}30`,
                        color: p.color, fontSize: 10, padding: "4px 10px", borderRadius: 5,
                        letterSpacing: "0.05em",
                      }}>
                        {p.revModel}
                      </span>
                    </div>
                    <p style={{ color: "#667", fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>{p.goal}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {p.pillars.map(pid => {
                        const pillar = AAB_DATA.pillars.find(x => x.id === pid);
                        return pillar ? (
                          <span key={pid} style={{
                            background: `${pillar.color}12`,
                            border: `1px solid ${pillar.color}30`,
                            color: pillar.color,
                            fontSize: 10, padding: "3px 8px", borderRadius: 4,
                            letterSpacing: "0.08em",
                          }}>
                            {pillar.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Industry Problems Solved */}
          <div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
              Industry Problems Solved
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {[
                { problem: "Days wasted on project setup", solution: "Zero-config scaffold in < 5 minutes", icon: "⏱" },
                { problem: "Inconsistent code quality across projects", solution: "Enforced architecture, linting, and tested templates", icon: "◈" },
                { problem: "Rebuilt components on every project", solution: "Private Component Registry with version control", icon: "◎" },
                { problem: "Security vulnerabilities go unnoticed", solution: "AI Dependency Watcher + automated CVE PRs", icon: "◆" },
                { problem: "Junior devs stuck on boilerplate", solution: "AI Component Generator and AI Debugger", icon: "◐" },
                { problem: "Legacy codebases blocking modernization", solution: "AI Migration Agent with guided transformation", icon: "◑" },
                { problem: "Agency clients on different code standards", solution: "Cross-Project Sync Engine with approval flows", icon: "◷" },
                { problem: "No way to monetize expertise", solution: "Marketplace for templates, components, plugins", icon: "◉" },
                { problem: "Complex deployment and infra setup", solution: "One-click deploy + IaC generation", icon: "⬡" },
                { problem: "No visibility into project portfolio health", solution: "Org Analytics + dependency/sync dashboards", icon: "◑" },
                { problem: "Freelancers rebuilding same boilerplate", solution: "Personal registry + marketplace earnings", icon: "◻" },
                { problem: "Enterprise compliance overhead", solution: "Policy as Code + GDPR/SOC2/HIPAA checklist generation", icon: "◼" },
              ].map((item, i) => (
                <div key={i} style={{
                  background: "#0D0F14", border: "1px solid #1A1E28",
                  borderRadius: 8, padding: "16px 18px",
                }}>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>{item.icon}</div>
                  <div style={{ fontSize: 11, color: "#FF6B6B", marginBottom: 6, letterSpacing: "0.05em" }}>
                    PROBLEM: {item.problem}
                  </div>
                  <div style={{ fontSize: 12, color: "#00FFB2", lineHeight: 1.5 }}>
                    ▸ {item.solution}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REVENUE TAB */}
      {activeTab === "revenue" && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px" }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
              Monetization Architecture
            </h2>
            <p style={{ color: "#555", fontSize: 13 }}>Every developer, freelancer, and agency earns or saves. Every layer generates sustainable revenue.</p>
          </div>

          {/* Revenue Streams */}
          <div style={{ marginBottom: 40 }}>
            <h3 style={{ fontSize: 12, letterSpacing: "0.15em", color: "#555", marginBottom: 16, textTransform: "uppercase" }}>
              Revenue Streams
            </h3>
            <div style={{ border: "1px solid #1A1E28", borderRadius: 10, overflow: "hidden" }}>
              {REVENUE_STREAMS.map((r, i) => {
                const tierColors = {
                  Free: "#555", Pro: "#00FFB2", Agency: "#A78BFA",
                  Enterprise: "#FCD34D", Marketplace: "#4ADE80",
                  AI: "#FB923C", Cloud: "#38BDF8", Partner: "#F472B6",
                  Program: "#60A5FA",
                };
                return (
                  <div
                    key={i}
                    className="rev-row"
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 16,
                      padding: "16px 20px",
                      borderBottom: i < REVENUE_STREAMS.length - 1 ? "1px solid #111318" : "none",
                    }}
                  >
                    <span style={{
                      flexShrink: 0,
                      background: `${tierColors[r.tier] || "#444"}18`,
                      border: `1px solid ${tierColors[r.tier] || "#444"}40`,
                      color: tierColors[r.tier] || "#888",
                      fontSize: 9, letterSpacing: "0.1em",
                      padding: "3px 8px", borderRadius: 4,
                      minWidth: 80, textAlign: "center",
                    }}>
                      {r.tier}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: "#E8EAF0", marginBottom: 4 }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>{r.model}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Who Benefits */}
          <div>
            <h3 style={{ fontSize: 12, letterSpacing: "0.15em", color: "#555", marginBottom: 16, textTransform: "uppercase" }}>
              Who Benefits
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              {[
                {
                  persona: "Junior Developer",
                  color: "#00FFB2",
                  benefits: [
                    "Scaffold production projects without senior guidance",
                    "AI Debugger explains errors in plain language",
                    "AI Component Generator creates code from descriptions",
                    "Learn best practices from enforced template patterns",
                  ],
                },
                {
                  persona: "Senior Developer",
                  color: "#A78BFA",
                  benefits: [
                    "Never configure boilerplate again",
                    "Earn money selling templates and components on marketplace",
                    "Offload maintenance to AI Dependency Watcher",
                    "Focus on product logic, not infrastructure config",
                  ],
                },
                {
                  persona: "Freelancer",
                  color: "#38BDF8",
                  benefits: [
                    "Personal component registry across all client projects",
                    "Publish and sell personal template library",
                    "Appear more senior with production-grade scaffolds",
                    "Reduce time to first deploy = more clients served",
                  ],
                },
                {
                  persona: "Agency / Studio",
                  color: "#FB923C",
                  benefits: [
                    "Org-wide component registry = brand consistency",
                    "AI Sync Proposer keeps all client projects current",
                    "Onboard new devs to agency standards in < 30 min",
                    "Sell custom templates on marketplace as new revenue",
                  ],
                },
                {
                  persona: "Template Creator",
                  color: "#4ADE80",
                  benefits: [
                    "Build once, sell to thousands of developers",
                    "Recurring updates = ongoing marketplace presence",
                    "70-85% revenue share on sales",
                    "Certification program increases visibility and trust",
                  ],
                },
                {
                  persona: "Enterprise / CTO",
                  color: "#FCD34D",
                  benefits: [
                    "Policy as Code enforces architecture standards",
                    "Compliance report exports for audits",
                    "Portfolio health dashboard across all products",
                    "AI Migration Agent modernizes legacy codebases",
                  ],
                },
              ].map((p, i) => (
                <div key={i} style={{
                  background: "#0D0F14",
                  border: `1px solid ${p.color}25`,
                  borderRadius: 10,
                  padding: "18px 20px",
                  borderTop: `3px solid ${p.color}`,
                }}>
                  <h4 style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 15, fontWeight: 700,
                    color: p.color, marginBottom: 14,
                  }}>
                    {p.persona}
                  </h4>
                  {p.benefits.map((b, j) => (
                    <div key={j} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                      <span style={{ color: p.color, fontSize: 9, marginTop: 4, flexShrink: 0 }}>▸</span>
                      <span style={{ fontSize: 12, color: "#667", lineHeight: 1.5 }}>{b}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{
        borderTop: "1px solid #1A1E28",
        padding: "24px 32px",
        marginTop: 40,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
      }}>
        <span style={{ fontSize: 11, color: "#333", letterSpacing: "0.1em" }}>
          @APPINIT · AAB V1.0 · UNIVERSAL DEVELOPMENT OPERATING SYSTEM
        </span>
        <span style={{ fontSize: 11, color: "#333" }}>
          {AAB_DATA.pillars.length} subsystems · {Object.values(AAB_DATA.modules).reduce((a, m) => a + m.modules.length, 0)} modules · {Object.values(AAB_DATA.modules).reduce((a, m) => a + m.modules.reduce((b, mod) => b + mod.features.length, 0), 0)} features defined
        </span>
      </div>
    </div>
  );
}
