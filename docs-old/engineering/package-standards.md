| Package        | Category        | Why we use it                                         | Alternatives Considered | Used By       | Status      |
| -------------- | --------------- | ----------------------------------------------------- | ----------------------- | ------------- | ----------- |
| turbo          | Build System    | Monorepo task orchestration and caching               | Nx, Lage                | Entire repo   | ✅ Required |
| pnpm           | Package Manager | Fast, disk-efficient workspace management             | npm, Yarn               | Entire repo   | ✅ Required |
| typescript     | Language        | Static typing                                         | JavaScript              | Entire repo   | ✅ Required |
| @biomejs/biome | Lint/Format     | Fast formatter and linter replacing ESLint + Prettier | ESLint + Prettier       | Entire repo   | ✅ Required |
| vitest         | Testing         | Unit/integration testing                              | Jest                    | Packages, API | ✅ Required |
