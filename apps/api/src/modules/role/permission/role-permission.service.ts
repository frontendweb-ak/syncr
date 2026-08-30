import { BaseService } from "../../../core/base";
import { Errors } from "../../../errors";
import { RolePermissionRepo } from "./role-permission.repo";

export class RolePermissionService extends BaseService {
  private readonly repo = new RolePermissionRepo(this.db);

  async assignPermission(roleId: string, permissionId: string) {
    const existing = await this.repo.find(roleId, permissionId);
    if (existing) throw Errors.rolePermission.alreadyExists();
    return this.repo.assign(roleId, permissionId);
  }

  async removePermission(roleId: string, permissionId: string) {
    const existing = await this.repo.find(roleId, permissionId);
    if (!existing) throw Errors.rolePermission.notFound();
    await this.repo.remove(roleId, permissionId);
  }

  async getRolePermissions(roleId: string) {
    return this.repo.getPermissionsForRole(roleId);
  }
}
