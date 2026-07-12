import { rolePermissions } from "@syncr/db";
import {
  and,
  eq,
  type InferInsertModel,
  type InferSelectModel,
} from "drizzle-orm";
import { BaseRepo } from "../../../core/base/base.repo";

export type RolePermission = InferSelectModel<typeof rolePermissions>;
export type NewRolePermission = InferInsertModel<typeof rolePermissions>;

export class RolePermissionRepo extends BaseRepo {
  async assign(roleId: string, permissionId: string) {
    const [assignment] = await this.db
      .insert(rolePermissions)
      .values({ roleId, permissionId })
      .returning();

    return assignment;
  }

  async find(roleId: string, permissionId: string) {
    return this.db.query.rolePermissions.findFirst({
      where: and(
        eq(rolePermissions.roleId, roleId),
        eq(rolePermissions.permissionId, permissionId),
      ),
    });
  }

  async getPermissionsForRole(roleId: string) {
    return this.db.query.rolePermissions.findMany({
      where: eq(rolePermissions.roleId, roleId),
      with: {
        permission: true,
      },
    });
  }

  async getRolesForPermission(permissionId: string) {
    return this.db.query.rolePermissions.findMany({
      where: eq(rolePermissions.permissionId, permissionId),
      with: {
        role: true,
      },
    });
  }

  async remove(roleId: string, permissionId: string) {
    await this.db
      .delete(rolePermissions)
      .where(
        and(
          eq(rolePermissions.roleId, roleId),
          eq(rolePermissions.permissionId, permissionId),
        ),
      );
  }
}
