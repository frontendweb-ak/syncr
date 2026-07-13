// src/modules/github/install/install.route.ts + install.controller.ts + install.service.ts
// (kept in one file for this deliverable — split into three following
// your existing module convention when you merge this in)
//
// This is the ONLY place a provider_connections row gets CREATED. The
// webhook handler (installation-webhook.handler.ts) only ever UPDATES a
// row that already exists, because the webhook has no way to know which
// Syncr organization an installation belongs to — only this
// browser-driven flow does, via the signed `state` param.

import { Hono } from "hono";
import { SignJWT, jwtVerify } from "jose";
import { Errors } from "../../../errors";
import type { AppContext, AppCtx } from "../../../types/env";
import { GithubAppService } from "../app/github-app.service";
import { ProviderConnectionRepo } from "./provider-connection.repo";

const STATE_TTL_SECONDS = 10 * 60; // install flow should complete well within 10 minutes

// ─────────────────────────────────────────────────────────────
// State token — proves "this callback corresponds to a connect
// request WE issued for THIS org, started by THIS user" without
// needing server-side session storage for the install flow.
// ─────────────────────────────────────────────────────────────

async function signInstallState(config: any, organizationId: string, userId: string) {
  const secret = new TextEncoder().encode(config.JWT_SECRET); // reuse your existing JWT secret, or a dedicated one
  return new SignJWT({ organizationId, userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${STATE_TTL_SECONDS}s`)
    .sign(secret);
}

async function verifyInstallState(config: any, state: string) {
  const secret = new TextEncoder().encode(config.JWT_SECRET);
  try {
    const { payload } = await jwtVerify(state, secret);
    return payload as { organizationId: string; userId: string };
  } catch {
    throw Errors.github.installStateInvalid();
  }
}

// ─────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────

const install = new Hono<AppContext>();

/**
 * GET /api/v1/integrations/github/connect
 * Authenticated. Redirects the browser to GitHub's install picker with
 * a signed state param identifying which org is connecting.
 */
install.get("/connect", async (c: AppCtx) => {
  const auth = c.get("auth");
  const config = c.get("config");
  // ASSUMPTION: org context comes from a query param or the user's
  // active org — adjust to however your app resolves "current org"
  // elsewhere (you likely already have this pattern for other routes).
  const organizationId = c.req.query("organizationId");
  if (!organizationId) throw Errors.validation.missingField("organizationId");

  const state = await signInstallState(config, organizationId, auth.sub);
  const url = `https://github.com/apps/${config.GITHUB_APP_SLUG}/installations/new?state=${encodeURIComponent(state)}`;
  return c.redirect(url);
});

/**
 * GET /api/v1/integrations/github/callback
 * PUBLIC — GitHub redirects the user's browser here after install/update.
 * No auth header will be present; the state token is what proves
 * legitimacy, not a session.
 */
install.get("/callback", async (c: AppCtx) => {
  const config = c.get("config");
  const db = c.get("db");
  const logger = c.get("logger");

  const installationId = c.req.query("installation_id");
  const setupAction = c.req.query("setup_action"); // "install" | "update" | "request"
  const state = c.req.query("state");

  if (!installationId || !state) {
    return c.redirect(`${config.APP_URL}/dashboard/integrations?error=missing_params`);
  }

  let statePayload;
  try {
    statePayload = await verifyInstallState(config, state);
  } catch {
    return c.redirect(`${config.APP_URL}/dashboard/integrations?error=invalid_state`);
  }

  if (setupAction === "request") {
    // A non-admin member requested installation — GitHub org owner still
    // has to approve it on GitHub's side. Nothing to link yet.
    return c.redirect(`${config.APP_URL}/dashboard/integrations?status=pending_approval`);
  }

  const githubApp = new GithubAppService(config);
  const installation = await githubApp.getInstallation(installationId);

  const repo = new ProviderConnectionRepo(db);

  // Idempotent by design (see module header) — handles both first-time
  // install and re-running setup ("update" action) safely.
  await repo.upsert({
    organizationId: statePayload.organizationId,
    provider: "GITHUB",
    accountId: String(installation.account.id),
    accountName: installation.account.login,
    installationId: String(installation.id),
    status: "CONNECTED",
    permissionsSnapshot: installation.permissions,
    suspendedAt: installation.suspended_at ? new Date(installation.suspended_at) : null,
    uninstalledAt: null,
  });

  logger?.info(
    { organizationId: statePayload.organizationId, installationId },
    "GitHub App installation linked",
  );

  return c.redirect(`${config.APP_URL}/dashboard/integrations?status=connected`);
});

export { install as githubInstallRoutes };
