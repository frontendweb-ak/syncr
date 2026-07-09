import { index, pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";

import { permissions } from "./permissions";
import { roles } from "./roles";

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.roleId, table.permissionId],
    }),

    index("role_permissions_role_idx").on(table.roleId),

    index("role_permissions_permission_idx").on(table.permissionId),
  ],
);