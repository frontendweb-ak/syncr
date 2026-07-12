// src/modules/organization/organization.route.ts
//
// Mount at /api/v1/organizations in routes.ts. All routes require a
// dashboard session — there is no CLI/API-key path into org/member/
// invite management, matching the same call made for api-keys.

import {
  AcceptInviteSchema,
  CreateInviteSchema,
  CreateOrganizationSchema,
} from "@syncr/validator";
import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth";
import { rateLimitMiddleware } from "../../middleware/rate-limit";
import { validate } from "../../middleware/validate";
import type { AppContext } from "../../types/env";
import { organizationInviteController } from "./invite/organization-invite.controller";
import { organizationController } from "./organization.controller";

const organizations = new Hono<AppContext>();

organizations.use("*", authMiddleware);

organizations.post(
  "/",
  validate(CreateOrganizationSchema),
  organizationController.create,
);
organizations.get("/", organizationController.listMine);
organizations.get("/:slug", organizationController.getBySlug);

organizations.get(
  "/:organizationId/members",
  organizationController.listMembers,
);
organizations.delete(
  "/:organizationId/members/:memberId",
  organizationController.removeMember,
);

organizations.post(
  "/:organizationId/invites",
  rateLimitMiddleware("ORG_INVITE_CREATE"),
  validate(CreateInviteSchema),
  organizationInviteController.create,
);
organizations.get(
  "/:organizationId/invites",
  organizationInviteController.list,
);
organizations.post(
  "/:organizationId/invites/:inviteId/resend",
  rateLimitMiddleware("ORG_INVITE_RESEND"),
  organizationInviteController.resend,
);
organizations.delete(
  "/:organizationId/invites/:inviteId",
  organizationInviteController.revoke,
);

// Not org-scoped in the URL — see note in organization-invite.controller.ts
organizations.post(
  "/invites/accept",
  validate(AcceptInviteSchema),
  organizationInviteController.accept,
);

export { organizations as organizationRoutes };
