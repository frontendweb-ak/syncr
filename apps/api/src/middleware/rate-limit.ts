// src/middleware/rate-limit.ts
//
// Fixed-window rate limiting via KvStore (Workers KV in production, an
// in-memory Map on Node — see lib/kv-store/kv-store.ts).
//
// Usage:
//   app.use("/api/v1/auth/*", rateLimitMiddleware("auth"));
//   app.use("/api/v1/uploads/*", rateLimitMiddleware("upload"));
//
// Keys by authenticated user id when available (c.get("auth")?.sub),
// falling back to client IP — a logged-in user is rate limited per-account
// regardless of device/IP, while unauthenticated traffic (e.g. the login
// endpoint itself, before a user id exists) is limited per-IP.

import { createMiddleware } from "hono/factory";
import type { RateLimitPolicy } from "../config";
import { RATE_LIMIT_RULES } from "../config/rate-limit";
import { RateLimitException } from "../errors/rate-limit.error";
import { createKvStore } from "../lib/kv-store/kv-store";
import type { AppContext, AppCtx } from "../types/env";

function getClientIp(c: AppCtx): string {
  // Cloudflare sets this; falls back to a generic header for local/proxy
  // setups, then to "unknown" rather than throwing — an unidentifiable
  // client still gets rate limited, just bucketed together.
  return (
    c.req.header("cf-connecting-ip") ??
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export function rateLimitMiddleware(
  policy: RateLimitPolicy,
  keyBuilder?: (c: AppCtx) => Promise<string>,
) {
  const rule = RATE_LIMIT_RULES[policy];

  return createMiddleware<AppContext>(async (c, next) => {
    const store = createKvStore(c.env.RATE_LIMIT);

    const auth = c.get("auth");
    const identity = keyBuilder
      ? keyBuilder(c)
      : auth?.sub
        ? `user:${auth.sub}`
        : `ip:${getClientIp(c)}`;
    const key = `ratelimit:${policy}:${identity}`;

    const count = await store.increment(key, rule?.windowSeconds);
    const remaining = Math.max(0, rule?.requests - count);

    c.header("X-RateLimit-Limit", String(rule.requests));
    c.header("X-RateLimit-Remaining", String(remaining));
    c.header("X-RateLimit-Reset", String(rule.windowSeconds));

    if (count > rule.requests) {
      c.header("Retry-After", String(rule.windowSeconds));
      throw new RateLimitException(
        `Too many requests. Limit: ${rule.requests} per ${rule.windowSeconds}s.`,
      );
    }

    await next();
  });
}
