import { BaseController } from "../../../core/base/base.controller";
import { requireParam } from "../../../core/http/request";
import type { AppCtx } from "../../../types/env";
import { RolePermissionService } from "./role-permission.service";

function makeRolePermissionService(c: AppCtx) {
  return new RolePermissionService(
    c.get("db"),
    c.get("config"),
    c.get("logger"),
  );
}

class RolePermissionController extends BaseController {
  async assign(c: AppCtx) {
    const { roleId, permissionId } = await c.req.json();
    const service = makeRolePermissionService(c);
    const result = await service.assignPermission(roleId, permissionId);
    return this.created(c, {
      data: result,
      message: "Permission assigned successfully.",
    });
  }

  async remove(c: AppCtx) {
    const roleId = requireParam(c, "roleId");
    const permissionId = requireParam(c, "permissionId");
    const service = makeRolePermissionService(c);
    await service.removePermission(roleId, permissionId);
    return this.noContent(c);
  }

  async list(c: AppCtx) {
    const service = makeRolePermissionService(c);
    const permissions = await service.getRolePermissions(
      requireParam(c, "roleId"),
    );
    return this.ok(c, permissions, 200, "Permissions fetched successfully.");
  }
}

export const rolePermissionController = new RolePermissionController();
