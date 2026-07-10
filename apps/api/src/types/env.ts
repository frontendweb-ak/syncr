// src/types/env.ts

import type { Db } from "@syncr/db";
import { DeviceInput } from "@syncr/types";
import type { Context } from "hono";
import type { Logger } from "pino";
import type { AppConfig } from "../config";
import type { BetterAuthState } from "../lib/auth/better-auth";
import type { AccessTokenPayload, JwtService } from "../lib/jwt";
import type { AppEnv } from "./cloudflare";
export type AppVariables = {
  db: Db;
  logger: Logger;
  config: AppConfig;
  // Set by jwtMiddleware (app.ts) — the JwtService instance, available to
  // authMiddleware and any route that needs to sign/verify a token
  // outside the standard auth flow (e.g. issuing a password-reset-scoped
  // token, Technical Design §4.5).
  jwt: JwtService;
  /**
   * Populated by authMiddleware. Optional because many routes (rate
   * limiting on public endpoints, the auth/login routes themselves, the
   * global error handler) run before or without authMiddleware ever
   * executing — typing this as always-present would mask real bugs at
   * exactly the call sites that most need to handle the unauthenticated
   * case correctly. This was previously typed as required despite this
   * same comment already saying otherwise — fixed to match.
   */
  auth: AccessTokenPayload;

  betterAuth: BetterAuthState;

  device: DeviceInput;
};

export type AppContext = {
  // Worker-only resources (e.g. R2), optional so they're correctly
  // `undefined` when running on Node. App config is NOT here — see
  // AppVariables.config, which is set identically on both runtimes.

  Bindings: AppEnv;
  Variables: AppVariables;
};

/**
 * Standard Hono context used throughout the application.
 */
export type AppCtx = Context<AppContext>;
