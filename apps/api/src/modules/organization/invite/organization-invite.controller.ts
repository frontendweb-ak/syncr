// src/modules/organization/organization-invite.controller.ts

import { created, ok } from "../../../core/base/base.controller";
import { requireParam } from "../../../core/http/request";
import type { AppCtx } from "../../../types/env";
import { OrganizationInviteService } from "./organization-invite.service";

function makeInviteService(c: AppCtx) {
  return new OrganizationInviteService(
    c.get("db"),
    c.get("jwt"),
    c.get("config"),
    c.get("logger"),
    c.get("email"),
  );
}

export const organizationInviteController = {
  async create(c: AppCtx) {
    const auth = c.get("auth");
    const body = await c.req.json();

    const service = makeInviteService(c);
    const { invite } = await service.create({
      organizationId: requireParam(c, "organizationId"),
      invitedByUserId: auth.sub,
      email: body.email,
      roleId: body.roleId,
    });

    // rawToken is intentionally NOT returned here — it only ever goes
    // out via the invite email, same principle as the API key secret
    // appearing in exactly one place.
    return created(c, {
      invite: {
        id: invite.id,
        email: invite.email,
        status: invite.status,
        expiresAt: invite.expiresAt,
      },
    });
  },

  async list(c: AppCtx) {
    const auth = c.get("auth");
    const organizationId = requireParam(c, "organizationId");

    const service = makeInviteService(c);
    const invites = await service.listPending(organizationId, auth.sub);

    return ok(c, {
      invites: invites.map((i) => ({
        id: i.id,
        email: i.email,
        status: i.status,
        expiresAt: i.expiresAt,
        resentCount: i.resentCount,
        lastSentAt: i.lastSentAt,
      })),
    });
  },

  async resend(c: AppCtx) {
    const auth = c.get("auth");
    const inviteId = requireParam(c, "inviteId");

    const service = makeInviteService(c);
    const invite = await service.resend(inviteId, auth.sub);

    return ok(c, {
      invite: { id: invite.id, resentCount: invite.resentCount },
    });
  },

  async revoke(c: AppCtx) {
    const auth = c.get("auth");
    const inviteId = requireParam(c, "inviteId");

    const service = makeInviteService(c);
    await service.revoke(inviteId, auth.sub);

    return ok(c, { revoked: true });
  },

  // Not nested under /organizations/:organizationId — the accepting
  // user doesn't know the org ID yet, only the token from their email.
  async accept(c: AppCtx) {
    const auth = c.get("auth");
    const body = await c.req.json();

    const service = makeInviteService(c);
    const result = await service.accept(body.token, auth.sub);

    return ok(c, {
      organizationId: result.organizationId,
      role: result.roleSlug,
    });
  },
};
