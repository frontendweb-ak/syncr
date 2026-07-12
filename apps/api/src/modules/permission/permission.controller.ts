import { BaseController } from "../../core/base/base.controller";
import { requireParam } from "../../core/http/request";
import type { AppCtx } from "../../types/env";
import { PermissionService } from "./permission.service";

function makePermissionService(c: AppCtx) {
  return new PermissionService(
    c.get("db"),
    c.get("jwt"),
    c.get("config"),
    c.get("logger"),
  );
}

class PermissionController extends BaseController {
  async create(c: AppCtx) {
    const body = await c.req.json();
    const service = makePermissionService(c);
    const permission = await service.createPermission(body);
    return this.created(c, permission);
  }

  async getById(c: AppCtx) {
    const service = makePermissionService(c);
    const permission = await service.getPermission(requireParam(c, "id"));
    return this.ok(c, permission);
  }

  async list(c: AppCtx) {
    const service = makePermissionService(c);
    const permissions = await service.getPermissions();
    return this.ok(c, permissions);
  }

  async update(c: AppCtx) {
    const body = await c.req.json();
    const service = makePermissionService(c);
    const permission = await service.updatePermission(
      requireParam(c, "id"),
      body,
    );

    return this.ok(c, permission);
  }

  async remove(c: AppCtx) {
    const service = makePermissionService(c);
    await service.deletePermission(requireParam(c, "id"));
    return this.noContent(c);
  }
}

export const permissionController = new PermissionController();
