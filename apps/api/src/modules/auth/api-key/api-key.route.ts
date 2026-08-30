// src/modules/api-keys/api-key.route.ts
//
// Mount this at /api/v1/api-keys in routes.ts — NOT inside auth.route.ts.
//   apiKeyRoutes.route("/api-keys", ...) alongside auth.route("/auth", ...)
//
// Dashboard-only (JWT via authMiddleware). The CLI authenticates WITH a
// PAT via apiKeyMiddleware on other route groups, but it cannot mint or
// revoke PATs of its own through this file — key lifecycle management
// stays behind a real session on purpose.

import {
  CreateApiKeySchema,
  ListApiKeysQuerySchema,
  RevokeApiKeyBodySchema,
} from "@syncr/validator";
import { Hono } from "hono";

import { authMiddleware } from "../../../middleware/auth";
import { rateLimitMiddleware } from "../../../middleware/rate-limit";
import { validate, validateQuery } from "../../../middleware/validate";
import type { AppContext } from "../../../types/env";
import { apiKeyController } from "./api-key.controller";

const apiKeys = new Hono<AppContext>();
apiKeys.use("*", authMiddleware);
apiKeys.post(
  "/",
  rateLimitMiddleware("API_KEY_CREATE"),
  validate(CreateApiKeySchema),
  apiKeyController.create,
);

apiKeys.get("/", validateQuery(ListApiKeysQuerySchema), apiKeyController.list);

// apiKeys.patch(
//   "/:apiKeyId",
//   validate(RenameApiKeySchema),
//   apiKeyController.rename,
// );

// apiKeys.post(
//   "/:apiKeyId/rotate",
//   rateLimitMiddleware("API_KEY_ROTATE"),
//   validate(RotateApiKeySchema),
//   apiKeyController.rotate,
// );
apiKeys.delete(
  "/:apiKeyId",
  validate(RevokeApiKeyBodySchema),
  apiKeyController.revoke,
);

export { apiKeys as apiKeyRoutes };
