import type { KVNamespace, R2Bucket } from "@cloudflare/workers-types";
import type { AppConfig } from "../config/schema";
/**
 * Bindings that exist ONLY when running on Cloudflare Workers
 * (src/index.ts), injected by the Workers runtime per wrangler.jsonc.
 *
 * On Node (src/server.ts via @hono/node-server) there is no equivalent —
 * c.env is empty there. Every field here is therefore optional so that
 * `c.env.STORAGE` is typed as `R2Bucket | undefined` everywhere, forcing
 * call sites to guard for the Node case rather than assuming Workers.
 *
 * Do NOT put AppConfig fields here — config is environment-agnostic and
 * already available as the `config` Variable (c.get("config")) on both
 * runtimes, set once by createConfigMiddleware. Bindings are strictly for
 * Workers-native resources (R2, KV, Queues, Hyperdrive, etc.) that simply
 * don't exist outside the Workers runtime.
 */
export interface AppEnv extends AppConfig {
  STORAGE: R2Bucket;
  /**
   * Backs rate limiting and idempotency-key storage on Workers. On Node
   * this is undefined and createKvStore() falls back to an in-memory Map
   * — see lib/kv-store/kv-store.ts.
   */
  RATE_LIMIT?: KVNamespace;
}

/**
 * The raw `env` object the Workers runtime passes into `fetch(request, env,
 * ctx)` — this is everything wrangler.jsonc's `vars`/secrets plus bindings
 * produce, BEFORE validation. It's the input to envSchema.parse() in
 * config/worker.ts, not the type used for Hono's `Bindings` generic.
 *
 * Distinct from AppBindings on purpose: AppBindings is what's available as
 * `c.env` inside route handlers (Workers-native resources only, optional so
 * Node is handled correctly); WorkerRuntimeEnv is what Cloudflare hands the
 * top-level fetch() handler before AIM's own config validation runs.
 */
export interface WorkerRuntimeEnv extends Partial<AppConfig> {
  STORAGE: R2Bucket;
  RATE_LIMIT: KVNamespace;
}
