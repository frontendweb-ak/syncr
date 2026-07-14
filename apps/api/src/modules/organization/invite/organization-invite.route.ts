// src/modules/organization/invite/organization-invite.route.ts

import { Hono } from "hono";
import { authMiddleware } from "../../../middleware/auth";
import type { AppContext } from "../../../types/env";
import { organizationInviteController } from "./organization-invite.controller";

// Mounted under /organizations/:id/invites — admin-only actions
export const organizationInviteRoutes = new Hono<AppContext>();
organizationInviteRoutes.use("*", authMiddleware);
organizationInviteRoutes.post("/", organizationInviteController.create);
organizationInviteRoutes.get("/", organizationInviteController.list);
organizationInviteRoutes.delete(
  "/:inviteId",
  organizationInviteController.revoke,
);

// Mounted separately at /invites — accept/decline, not org-scoped in
// the URL since the accepting user isn't a member of the org yet
export const inviteActionRoutes = new Hono<AppContext>();
inviteActionRoutes.post(
  "/accept",
  authMiddleware,
  organizationInviteController.accept,
);
inviteActionRoutes.post("/decline", organizationInviteController.decline); // no auth — declining requires no account
