// src/config/rate-limit.ts

import { PLATFORM } from './constants'

export type RateLimitTier = keyof typeof PLATFORM.RATE_LIMITS

export interface RateLimitRule {
  requests: number
  windowSeconds: number
}

/**
 * Parses the "1 m" / "10 s" / "1 h" style window strings in
 * PLATFORM.RATE_LIMITS into seconds. Kept intentionally tiny — only the
 * units actually used in constants.ts are supported.
 */
function _parseWindow(window: string): number {
  const match = window.trim().match(/^(\d+)\s*([smh])$/)
  if (!match) {
    throw new Error(
      `Invalid rate limit window "${window}" — expected formats like "1 m", "30 s", "1 h"`,
    )
  }

  const value = Number.parseInt(match[0], 10)
  const unit = match[2]

  const multiplier = unit === 's' ? 1 : unit === 'm' ? 60 : 3600
  return value * multiplier
}

/**
 * All rate limit tiers from PLATFORM.RATE_LIMITS, pre-parsed into seconds.
 * Built once at module load — this object is pure config, has no
 * dependency on request-scoped state, and is safe to share across every
 * request/isolate.
 */
export const RATE_LIMIT_RULES: Record<RateLimitTier, RateLimitRule> = Object.fromEntries(
  Object.entries(PLATFORM.RATE_LIMITS).map(([tier, rule]) => [
    tier,
    { requests: rule.requests, windowSeconds: rule.windowSeconds },
  ]),
) as Record<RateLimitTier, RateLimitRule>
