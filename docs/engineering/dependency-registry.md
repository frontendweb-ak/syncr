# Dependency Registry

Every dependency added to Syncr must be documented here.

| Package         | Version | Category         | Purpose                              | Used By      | Status |
| --------------- | ------- | ---------------- | ------------------------------------ | ------------ | ------ |
| turbo           | 2.10.0  | Build System     | Monorepo orchestration               | Entire repo  | Core   |
| pnpm            | 11.x    | Package Manager  | Workspace package manager            | Entire repo  | Core   |
| typescript      | 5.x     | Language         | Static typing                        | Entire repo  | Core   |
| @types/node     | 26.x    | Types            | Node.js typings                      | Backend      | Core   |
| @biomejs/biome  | 2.x     | Linter/Formatter | Replaces ESLint + Prettier           | Entire repo  | Core   |
| vitest          | 4.x     | Testing          | Unit & integration testing           | Packages/API | Core   |
| tsx             | 4.x     | Runtime          | Execute TypeScript directly          | Scripts      | Core   |
| @changesets/cli | 2.x     | Release          | Versioning & release management      | CI           | Core   |
| cross-env       | 10.x    | Environment      | Cross-platform environment variables | Scripts      | Core   |
| dotenv-cli      | 11.x    | Environment      | Load .env files in scripts           | Scripts      | Core   |
