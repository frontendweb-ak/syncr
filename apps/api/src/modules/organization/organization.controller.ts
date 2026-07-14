// src/modules/organization/organization.controller.ts

import { created, ok } from "../../core/base/base.controller";
import { requireParam } from "../../core/http/request";
import type { AppCtx } from "../../types/env";
import { OrganizationService } from "./organization.service";

function makeOrganizationService(c: AppCtx) {
  return new OrganizationService(
    c.get("db"),
    c.get("jwt"),
    c.get("config"),
    c.get("logger"),
  );
}

export const organizationController = {
  async getById(c: AppCtx) {
    const slug = requireParam(c, "slug");
    const service = makeOrganizationService(c);
    const org = await service.getById(slug);
    return ok(c, org);
  },

  async create(c: AppCtx) {
    const auth = c.get("auth");
    const body = await c.req.json();

    const service = makeOrganizationService(c);
    const org = await service.createOrganization({
      userId: auth.sub,
      name: body.name,
      slug: body.slug,
    });

    return created(c, org, "Organization created successfully.");
  },

  async listMine(c: AppCtx) {
    const auth = c.get("auth");
    const service = makeOrganizationService(c);
    const result = await service.listForUser(auth.sub);
    return ok(c, result);
  },

  async update(c: AppCtx) {
    const auth = c.get("auth");
    const id = requireParam(c, "id");
    const body = await c.req.json();
    const service = makeOrganizationService(c);
    const result = await service.update(id, auth.sub, {
      name: body.name,
      displayName: body.displayName,
      description: body.description,
    });
    return ok(c, result);
  },
  async getBySlug(c: AppCtx) {
    const slug = requireParam(c, "slug");
    const service = makeOrganizationService(c);
    const org = await service.getBySlug(slug);
    return ok(c, { organization: org });
  },

  async listMembers(c: AppCtx) {
    const organizationId = requireParam(c, "organizationId");
    const service = makeOrganizationService(c);
    const members = await service.listMembers(organizationId);
    return ok(c, { members });
  },

  async removeMember(c: AppCtx) {
    const auth = c.get("auth");
    const organizationId = requireParam(c, "organizationId");
    const memberId = requireParam(c, "memberId");

    const service = makeOrganizationService(c);
    await service.removeMember(organizationId, memberId, auth.sub);

    return ok(c, { removed: true });
  },
};
