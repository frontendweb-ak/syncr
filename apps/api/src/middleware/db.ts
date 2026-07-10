// src/middleware/db.ts

import type { Db } from "@syncr/db";
import { createMiddleware } from "hono/factory";
import type { AppContext } from "../types/env";
/**
 * Attaches an already-built db instance to the request context.
 *
 * IMPORTANT: this must be called with a db instance built ONCE — in
 * createApp() — not constructed inside the middleware itself. createDb()
 * opens a new postgres-js connection pool every time it runs:
 *
 *   - On Node: createApp() runs once at process startup, so the old
 *     per-request `createDb()` call leaked a brand-new connection pool on
 *     EVERY request, forever, for the lifetime of the long-running process.
 *     Postgres's max_connections (and the process's file descriptor limit)
 *     would be exhausted within minutes under real traffic.
 *   - On Workers: createApp() runs once per isolate, but a busy isolate
 *     still serves many requests before being recycled — same leak, just
 *     bounded by isolate lifetime instead of process lifetime. It also
 *     pays a full TCP+TLS handshake to Hyperdrive on every request instead
 *     of reusing a warm connection, which is pure added latency.
 *
 * Access anywhere in a route:
 *
 *   const db = c.get("db");
 */
export const dbMiddleware = (db: Db) =>
  createMiddleware<AppContext>(async (c, next) => {
    c.set("db", db);
    await next();
  });
