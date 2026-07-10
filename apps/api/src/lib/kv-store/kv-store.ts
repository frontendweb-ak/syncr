// src/lib/kv-store/kv-store.ts
//
// A tiny key-value interface that both runtimes can satisfy:
//   - Workers: backed by a real KV namespace binding (durable, shared
//     across isolates, eventually consistent).
//   - Node: backed by an in-memory Map with manual TTL expiry (process-
//     local only — resets on restart, never shared across instances).
//
// This exists because rate limiting, idempotency keys, and short-lived
// caches all need "store a value for N seconds" and nothing more — they
// should not be coupled to Workers KV specifically, since Node has no KV
// binding at all.
//
// IMPORTANT: the in-memory implementation is for local development only.
// It is explicitly NOT safe for a multi-instance Node deployment (e.g.
// behind a load balancer with more than one process) — each instance would
// rate-limit independently, which silently multiplies the effective limit.
// If AIM ever runs multiple Node instances in production, swap this for a
// real shared store (Redis/Upstash) — see the warning in createKvStore().

import type { KVNamespace } from '@cloudflare/workers-types'

export interface KvStore {
  get(key: string): Promise<string | null>
  /** ttlSeconds is required — every use case here is inherently short-lived. */
  put(key: string, value: string, ttlSeconds: number): Promise<void>
  delete(key: string): Promise<void>
  /** Atomic increment for counters (rate limiting). Returns the new count. */
  increment(key: string, ttlSeconds: number | undefined): Promise<number>
}

// ── Workers KV implementation ────────────────────────────────────────────

export class WorkersKvStore implements KvStore {
  constructor(private readonly kv: KVNamespace) {}

  async get(key: string): Promise<string | null> {
    return this.kv.get(key)
  }

  async put(key: string, value: string, ttlSeconds: number): Promise<void> {
    // KV requires expirationTtl >= 60 seconds — callers asking for less
    // than that get clamped rather than silently failing.
    await this.kv.put(key, value, {
      expirationTtl: Math.max(60, ttlSeconds),
    })
  }

  async delete(key: string): Promise<void> {
    await this.kv.delete(key)
  }

  async increment(key: string, ttlSeconds: number): Promise<number> {
    // KV has no atomic increment — this is a read-then-write, which has a
    // narrow race window under very high concurrent load on the SAME key
    // within the SAME isolate. Acceptable for rate limiting (worst case:
    // a handful of extra requests slip through right at the boundary),
    // not acceptable for anything requiring exact counts (e.g. billing).
    const current = await this.kv.get(key)
    const next = (current ? Number.parseInt(current, 10) : 0) + 1
    await this.put(key, String(next), ttlSeconds)
    return next
  }
}

// ── In-memory implementation (Node local dev) ────────────────────────────

interface MemoryEntry {
  value: string
  expiresAt: number
}

export class MemoryKvStore implements KvStore {
  private readonly store = new Map<string, MemoryEntry>()
  private sweepTimer: ReturnType<typeof setInterval> | undefined

  constructor() {
    // Periodic sweep so an idle dev server doesn't accumulate unbounded
    // expired entries between reads. Not required for correctness (get()
    // already checks expiry lazily) — purely to keep memory bounded.
    this.sweepTimer = setInterval(() => this.sweep(), 60_000)
    // Don't keep the Node process alive just for this timer.
    this.sweepTimer.unref?.()
  }

  private sweep(): void {
    const now = Date.now()
    for (const [key, entry] of this.store) {
      if (entry.expiresAt <= now) this.store.delete(key)
    }
  }

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key)
    if (!entry) return null
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key)
      return null
    }
    return entry.value
  }

  async put(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
  }

  async increment(key: string, ttlSeconds: number): Promise<number> {
    // Single-threaded JS — this is genuinely atomic within one process,
    // unlike the KV version above.
    const current = await this.get(key)
    const next = (current ? Number.parseInt(current, 10) : 0) + 1
    await this.put(key, String(next), ttlSeconds)
    return next
  }

  /** Test/shutdown helper — not part of the KvStore interface. */
  stopSweeping(): void {
    if (this.sweepTimer) clearInterval(this.sweepTimer)
  }
}

// ── Factory ───────────────────────────────────────────────────────────────

// One shared in-memory store per Node process — must be a singleton, not
// constructed per-request, or every request would get its own empty Map
// and rate limiting would never actually limit anything.
let nodeMemoryStore: MemoryKvStore | undefined

/**
 * Returns the appropriate KvStore for the current runtime.
 *
 * @param kvBinding - the Workers KV binding, if running on Workers
 *   (undefined on Node, per AppBindings — see types/cloudflare.ts).
 */
export function createKvStore(kvBinding: KVNamespace | undefined): KvStore {
  if (kvBinding) {
    return new WorkersKvStore(kvBinding)
  }

  if (!nodeMemoryStore) {
    nodeMemoryStore = new MemoryKvStore()
  }
  return nodeMemoryStore
}
