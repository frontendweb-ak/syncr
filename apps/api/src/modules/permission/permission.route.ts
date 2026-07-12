import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth";
import { permissionController } from "./permission.controller";

export const permissionRoutes = new Hono();

permissionRoutes.use("*", authMiddleware);
permissionRoutes.get("/", permissionController.list);
permissionRoutes.get("/:id", permissionController.getById);
permissionRoutes.post("/", permissionController.create);
permissionRoutes.patch("/:id", permissionController.update);
permissionRoutes.delete("/:id", permissionController.remove);
