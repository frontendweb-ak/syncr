import { Hono } from "hono";
import { authRoutes } from "./modules/auth/auth.route";
import { healthRoutes } from "./modules/health/health.route";
import type { AppContext } from "./types/env";

export const routes = new Hono<AppContext>();
// ── Infrastructure ──────────────────────────────────────────────────────────
routes.route("/health", healthRoutes);

routes.route("/auth", authRoutes);
