import { Hono } from "hono";
import { rateLimitMiddleware } from "./middleware/rate-limit";
import { authRoutes } from "./modules/auth/auth.route";
import { healthRoutes } from "./modules/health/health.route";
import type { AppContext } from "./types/env";

export const routes = new Hono<AppContext>();
// ── Infrastructure ──────────────────────────────────────────────────────────
routes.route("/health", healthRoutes);

routes.use("/auth/*", rateLimitMiddleware("auth"));
routes.route("/auth", authRoutes);
