import { rolePermissions } from "../src/schema";
import type { Db } from "../src/types";

const ROLE_PERMISSIONS: Record<string, string[]> = {
  owner: ["*"],

  admin: [
    "syncr:organization:read",
    "syncr:organization:update",

    "syncr:member:read",
    "syncr:member:invite",
    "syncr:member:remove",
    "syncr:member:update_role",

    "syncr:role:read",
    "syncr:role:create",
    "syncr:role:update",
    "syncr:role:delete",

    "syncr:workspace:read",
    "syncr:workspace:create",
    "syncr:workspace:update",
    "syncr:workspace:archive",

    "syncr:repository:read",
    "syncr:repository:create",
    "syncr:repository:update",
    "syncr:repository:delete",

    "syncr:component:read",
    "syncr:component:create",
    "syncr:component:update",
    "syncr:component:delete",

    "syncr:sync:read",
    "syncr:sync:create",
    "syncr:sync:approve",
    "syncr:sync:reject",

    "syncr:scan:read",
    "syncr:scan:create",
    "syncr:scan:cancel",

    "syncr:vulnerability:read",
    "syncr:vulnerability:update",

    "syncr:secret:read",
    "syncr:secret:create",
    "syncr:secret:update",
    "syncr:secret:delete",

    "syncr:variable:read",
    "syncr:variable:create",
    "syncr:variable:update",
    "syncr:variable:delete",

    "syncr:api_key:read",
    "syncr:api_key:create",
    "syncr:api_key:revoke",

    "syncr:billing:read",
    "syncr:billing:update",

    "syncr:subscription:read",
    "syncr:subscription:update",

    "syncr:audit_log:read",
    "syncr:security_event:read",
  ],

  developer: [
    "syncr:workspace:read",

    "syncr:repository:read",
    "syncr:repository:create",
    "syncr:repository:update",

    "syncr:component:read",
    "syncr:component:create",
    "syncr:component:update",

    "syncr:sync:read",
    "syncr:sync:create",

    "syncr:scan:read",
    "syncr:scan:create",

    "syncr:vulnerability:read",

    "syncr:secret:read",
    "syncr:secret:create",
    "syncr:secret:update",

    "syncr:variable:read",
    "syncr:variable:create",
    "syncr:variable:update",
  ],

  viewer: [
    "syncr:organization:read",
    "syncr:workspace:read",
    "syncr:repository:read",
    "syncr:component:read",
    "syncr:sync:read",
    "syncr:scan:read",
    "syncr:vulnerability:read",
    "syncr:secret:read",
    "syncr:variable:read",
    "syncr:audit_log:read",
  ],
};

export async function seedRolePermissions(db: Db) {
  const [allRoles, allPermissions] = await Promise.all([
    db.query.roles.findMany(),
    db.query.permissions.findMany(),
  ]);

  const roleMap = new Map(allRoles.map((r) => [r.slug, r]));
  const permissionMap = new Map(allPermissions.map((p) => [p.name, p]));

  const values: (typeof rolePermissions.$inferInsert)[] = [];

  for (const [roleSlug, permissionNames] of Object.entries(ROLE_PERMISSIONS)) {
    const role = roleMap.get(roleSlug);

    if (!role) continue;

    const permissions = permissionNames.includes("*")
      ? allPermissions
      : permissionNames
          .map((name) => permissionMap.get(name))
          .filter((p): p is (typeof allPermissions)[number] => !!p);

    for (const permission of permissions) {
      values.push({
        roleId: role.id,
        permissionId: permission.id,
      });
    }
  }

  await db.insert(rolePermissions).values(values).onConflictDoNothing();
}
