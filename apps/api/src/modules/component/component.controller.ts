// src/modules/registry/component/component.controller.ts

import { created, noContent, ok } from "../../core/base/base.controller";
import { requireParam } from "../../core/http/request";
import type { AppCtx } from "../../types/env";
import { R2StorageService } from "../registry/storage/storage.service";
import { ComponentService } from "./component.service";

// ASSUMPTION: org context resolution — every route below needs
// organizationId. I used `c.get("auth").organizationId`, but your
// AccessTokenPayload (from jwt.ts) doesn't currently carry one — it has
// sub/sessionId/deviceId/role. You'll need either to add organizationId
// to the access token payload (requires re-issuing tokens on org switch)
// or resolve it from a header/route param instead. Flagging rather than
// picking silently — this affects every multi-tenant route, not just
// this module, so it's worth deciding once centrally.
function getOrgId(c: AppCtx): string {
  const orgId = c.req.header("x-organization-id");
  if (!orgId)
    throw new Error(
      "organizationId resolution not wired — see component.controller.ts note",
    );
  return orgId;
}

function makeComponentService(c: AppCtx) {
  const storage = new R2StorageService(c.env.STORAGE);
  return new ComponentService(
    c.get("db"),
    c.get("jwt"),
    c.get("config"),
    c.get("logger"),
    storage,
  );
}

export const componentController = {
  async create(c: AppCtx) {
    const body = await c.req.json();
    const service = makeComponentService(c);
    const result = await service.create({
      organizationId: getOrgId(c),
      slug: body.slug,
      name: body.name,
      description: body.description,
      framework: body.framework,
      isPublic: body.isPublic,
    });
    return created(c, result);
  },

  async list(c: AppCtx) {
    const includeDeprecated = c.req.query("includeDeprecated") === "true";
    const service = makeComponentService(c);
    const result = await service.list(getOrgId(c), includeDeprecated);
    return ok(c, result);
  },

  async get(c: AppCtx) {
    const slug = requireParam(c, "slug");
    const service = makeComponentService(c);
    const result = await service.get(getOrgId(c), slug);
    return ok(c, result);
  },

  async update(c: AppCtx) {
    const slug = requireParam(c, "slug");
    const body = await c.req.json();
    const service = makeComponentService(c);
    const result = await service.update(getOrgId(c), slug, {
      name: body.name,
      description: body.description,
    });
    return ok(c, result);
  },

  async deprecate(c: AppCtx) {
    const slug = requireParam(c, "slug");
    const body = await c.req.json();
    const service = makeComponentService(c);
    const result = await service.deprecate(getOrgId(c), slug, body.note);
    return ok(c, result);
  },

  async remove(c: AppCtx) {
    const slug = requireParam(c, "slug");
    const service = makeComponentService(c);
    await service.delete(getOrgId(c), slug);
    return noContent(c);
  },

  // ── Versions ──────────────────────────────────────────────────

  async publish(c: AppCtx) {
    const slug = requireParam(c, "slug");
    const auth = c.get("auth");

    // Multipart form: metadata fields + tarball file. Adjust to however
    // your other upload endpoints (if any exist) parse multipart — Hono's
    // c.req.parseBody() is the standard path if none exist yet.
    const body = await c.req.parseBody();
    const tarballFile = body.tarball as File;
    if (!tarballFile) throw new Error("tarball field missing from upload");

    const service = makeComponentService(c);
    const result = await service.publish({
      organizationId: getOrgId(c),
      slug,
      version: body.version as string,
      changelog: body.changelog as string,
      isBreaking: body.isBreaking === "true",
      tarball: await tarballFile.arrayBuffer(),
      contentHash: body.contentHash as string,
      publishedByUserId: auth.sub,
    });
    return created(c, result);
  },

  async listVersions(c: AppCtx) {
    const slug = requireParam(c, "slug");
    const service = makeComponentService(c);
    const result = await service.listVersions(getOrgId(c), slug);
    return ok(c, result);
  },

  async getVersion(c: AppCtx) {
    const slug = requireParam(c, "slug");
    const version = requireParam(c, "version");
    const service = makeComponentService(c);
    const result = await service.getVersion(getOrgId(c), slug, version);
    return ok(c, result);
  },
};
