import type { ExecutionContext } from "hono";
import { createApp } from "./app";
import { getEnv } from "./config/worker";
import type { AppEnv } from "./types/cloudflare";
/**
 * Workers has no equivalent of Node's "process boots once, env is already
 * populated" — env/secrets only become available once the runtime calls
 * fetch(). That means createApp() (and the db pool / logger it builds
 * inside) genuinely cannot be constructed at true module top-level here.
 *
 * The correct pattern is to build it ONCE on the first request a given
 * isolate handles, cache it in module scope, and reuse that same instance
 * — including its db connection pool — for every subsequent request the
 * isolate serves. A busy isolate handles many requests before Cloudflare
 * recycles it, so without this cache, createApp() (and therefore
 * createDb()) would still run on every single request even after fixing
 * dbMiddleware itself.
 *
 * This module-level `let` is safe: each Workers isolate is single-threaded
 * and gets its own module scope, so there's no cross-request race and no
 * cross-tenant leakage between isolates.
 */
export default {
  fetch(request: Request, env: AppEnv, ctx: ExecutionContext) {
    // env here is the raw, unvalidated Workers runtime object — getEnv()
    // validates it into AppConfig (passed to createApp), while the same
    // raw env is also passed through as Hono's Bindings so route handlers
    // can reach Workers-native resources like c.env.STORAGE directly.
    return createApp(getEnv(env)).fetch(request, env, ctx);
  },
};
