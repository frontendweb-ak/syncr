// src/modules/auth/auth.route.ts
//
// API Contract: 04_AUTH_API_CONTRACT.md
// All routes mounted under /api/v1/auth (see routes.ts)

import { LoginSchema, RegisterSchema } from "@syncr/validator";
import { Hono } from "hono";
import { validate } from "../../middleware/validate";
import type { AppContext } from "../../types/env";
import { authController } from "./auth.controller";

const auth = new Hono<AppContext>();

auth.post("/register", validate(RegisterSchema), authController.register);
auth.post("/login", validate(LoginSchema), authController.loginEmail);

export { auth as authRoutes };

