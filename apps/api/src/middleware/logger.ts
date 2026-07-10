import { createMiddleware } from "hono/factory";

import type { Logger } from "pino";
import type { AppContext } from "../types/env";

/**
 * Takes an already-constructed base logger (built once per process/isolate
 * in createApp — see app.ts) and attaches a per-request child logger with
 * requestId/method/path bound in. Building a fresh pino instance on every
 * request would be wasteful; .child() is cheap and is what pino is designed
 * for here.
 */
export const loggerMiddleware = (logger: Logger) =>
  createMiddleware<AppContext>(async (c, next) => {
    const started = performance.now();

    const requestId = c.req.header("X-Request-Id") ?? crypto.randomUUID();

    const log = logger.child({
      requestId,
      method: c.req.method,
      path: c.req.path,
    });

    c.set("logger", log);

    try {
      await next();

      log.info({
        status: c.res.status,
        duration: Math.round(performance.now() - started),
      });
    } catch (error) {
      log.error({
        err: error,
        duration: Math.round(performance.now() - started),
      });

      throw error;
    }
  });
