// src/config/rate-limit.ts

import type { RateLimitPolicy } from "./constants";
import { RATE_LIMIT } from "./constants";

export interface RateLimitRule {
  requests: number;
  windowSeconds: number;
}

/**
 * All rate limit tiers from PLATFORM.RATE_LIMITS, pre-parsed into seconds.
 * Built once at module load — this object is pure config, has no
 * dependency on request-scoped state, and is safe to share across every
 * request/isolate.
 */
export const RATE_LIMIT_RULES: Record<RateLimitPolicy, RateLimitRule> =
  Object.fromEntries(
    Object.entries(RATE_LIMIT).map(([key, value]) => [
      key,
      { requests: value.REQUESTS, windowSeconds: value.WINDOW_SECONDS },
    ]),
  ) as Record<RateLimitPolicy, RateLimitRule>;