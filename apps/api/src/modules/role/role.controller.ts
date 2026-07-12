import { BaseController } from "../../core/base/base.controller";
import { requireParam } from "../../core/http/request";
import type { AppCtx } from "../../types/env";
import { RoleService } from "./role.service";

function makeRoleService(c: AppCtx) {
  return new RoleService(
    c.get("db"),
    c.get("jwt"),
    c.get("config"),
    c.get("logger"),
  );
}

class RoleController extends BaseController {
  async create(c: AppCtx) {
    const body = await c.req.json();
    const service = makeRoleService(c);
    const role = await service.createRole(body);
    return this.created(c, {
      data: role,
      message: "Role created successfully.",
    });
  }

  async getById(c: AppCtx) {
    const service = makeRoleService(c);
    const role = await service.getRole(requireParam(c, "id"));
    return this.ok(c, role, 200, "Role fetched successfully.");
  }

  async list(c: AppCtx) {
    const service = makeRoleService(c);
    const organizationId = c.req.query("organizationId");
    const roles = await service.getRoles(organizationId);
    return this.ok(c, roles, 200, "Roles fetched successfully.");
  }

  async update(c: AppCtx) {
    const body = await c.req.json();
    const service = makeRoleService(c);
    const role = await service.updateRole(requireParam(c, "id"), body);
    return this.ok(c, role, 200, "Role updated successfully.");
  }

  async remove(c: AppCtx) {
    const service = makeRoleService(c);
    await service.deleteRole(requireParam(c, "id"));
    return this.noContent(c);
  }
}

export const roleController = new RoleController();
