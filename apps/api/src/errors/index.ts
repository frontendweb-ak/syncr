// ─────────────────────────────────────────────────────────────────
// errors/index.ts
// ─────────────────────────────────────────────────────────────────
// Public entry point. `Errors.<domain>.<reason>()` returns a ready-to-
// throw HttpException subclass with the correct status, ErrorCode and
// message wired up.
//
// Adding a new module (e.g. "billing"):
//   1. Add its codes to errors/codes.ts (own fenced section)
//   2. Add its default messages to errors/messages.ts
//   3. Create errors/catalog/billing.errors.ts exporting `billingErrors`
//   4. Spread it into the `Errors` object below
// Never edit an existing domain's codes/messages in place — add new
// ones and deprecate old ones instead, so nothing breaks for clients
// depending on old ErrorCode values.
// ─────────────────────────────────────────────────────────────────

import { commerceErrors } from "./catalog/commerce.errors";
import { githubErrors } from "./catalog/github.errors";
import { identityErrors } from "./catalog/identity.errors";
import { platformErrors } from "./catalog/platform.errors";
import { rbacErrors } from "./catalog/rbac.errors";
import { workspaceErrors } from "./catalog/workspace.errors";

export * from "./codes";
export * from "./handler";
export * from "./messages";

export const Errors = {
  ...identityErrors, // auth, apiKey, device, user, profile
  ...workspaceErrors, // organization, project, provider, workspace
  ...platformErrors, // sync, appInit, validation, upload, database
  ...commerceErrors, // checkout, payment
  ...rbacErrors,
  ...githubErrors,
} as const;
