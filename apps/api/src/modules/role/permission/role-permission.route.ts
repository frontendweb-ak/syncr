import { Hono } from "hono";
import { authMiddleware } from "../../../middleware/auth";
import { rolePermissionController } from "./role-permission.controller";

export const rolePermissionRoutes = new Hono();

rolePermissionRoutes.use("*", authMiddleware);
rolePermissionRoutes.get("/:roleId/permissions", rolePermissionController.list);
rolePermissionRoutes.post(
  "/:roleId/permissions",
  rolePermissionController.assign,
);

rolePermissionRoutes.delete(
  "/:roleId/permissions/:permissionId",
  rolePermissionController.remove,
);
