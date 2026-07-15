import { Hono } from "hono";
import { apiKeyRoutes } from "./modules/auth/api-key/api-key.route";
import { authRoutes } from "./modules/auth/auth.route";
import { componentRoutes } from "./modules/component/component.route";
import { githubInstallRoutes } from "./modules/github/app/install/install.route";
import { githubWebhookRoutes } from "./modules/github/app/webhook/github-webhook.route";
import { healthRoutes } from "./modules/health/health.route";
import { organizationRoutes } from "./modules/organization/organization.route";
import { permissionRoutes } from "./modules/permission/permission.route";
import { rolePermissionRoutes } from "./modules/role/permission/role-permission.route";
import { roleRoutes } from "./modules/role/role.route";
import type { AppContext } from "./types/env";

export const routes = new Hono<AppContext>();
// ── Infrastructure ──────────────────────────────────────────────────────────
routes.route("/health", healthRoutes);

routes.route("/auth", authRoutes);
routes.route("/roles", roleRoutes);
routes.route("/roles", rolePermissionRoutes);
routes.route("/permissions", permissionRoutes);
routes.route("/api-keys", apiKeyRoutes);
routes.route("/organizations", organizationRoutes);
routes.route("/components", componentRoutes);
routes.route("/integrations/github", githubInstallRoutes);
routes.route("/webhook", githubWebhookRoutes);