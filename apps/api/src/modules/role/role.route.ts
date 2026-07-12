import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth";
import { roleController } from "./role.controller";

export const roleRoutes = new Hono();

roleRoutes.use("*", authMiddleware);
roleRoutes.get("/", roleController.list);
roleRoutes.post("/", roleController.create);
roleRoutes.get("/:id", roleController.getById);
roleRoutes.patch("/:id", roleController.update);
roleRoutes.delete("/:id", roleController.remove);
