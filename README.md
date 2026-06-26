syncr/
│
├── apps/
│   ├── api/                 # Hono API
│   ├── dashboard/           # Internal SaaS dashboard
│   ├── marketing/           # Landing page
│   ├── docs/                # Nextra documentation site
│   ├── github-app/          # GitHub App webhook service
│   ├── worker/              # Background jobs (Trigger.dev)
│   └── cli/                 # Syncr CLI
│
├── packages/
│   ├── core/                # Shared types, errors, utils
│   ├── config/              # Env/config loader
│   ├── database/            # Prisma client & repositories
│   ├── auth/                # Better Auth integration
│   ├── sdk/                 # Generated API SDK
│   ├── github/              # Octokit wrapper
│   ├── registry/            # Component registry
│   ├── sync/                # Sync engine
│   ├── ai/                  # AI providers
│   ├── storage/             # S3/R2 abstraction
│   ├── notifications/       # Email/Slack/Webhooks
│   ├── queue/               # Queue abstraction
│   ├── logger/              # Pino logging
│   ├── events/              # Domain events
│   └── ui/                  # Shared React components
│
├── tooling/
│   ├── typescript/
│   ├── biome/
│   ├── vitest/
│   ├── commitlint/
│   └── github/
│
├── infra/
│   ├── terraform/
│   ├── docker/
│   └── scripts/
│
├── docs/
│   ├── adr/
│   ├── architecture/
│   ├── engineering/
│   └── README.md
│
├── .github/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md