import { createDb } from "@syncr/db";
import { createEmailModule } from "@syncr/notifications";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { timing } from "hono/timing";
import type { AppConfig } from "./config";
import { errorHandler, notFoundHandler } from "./errors";
import { createLogger, JwtService } from "./lib";
// import { createAuth } from "./lib/auth/better-auth";
import { createConfigMiddleware } from "./middleware/config";
import { dbMiddleware } from "./middleware/db";
import { deviceMiddleware } from "./middleware/device";
import { jwtMiddleware } from "./middleware/jwt";
import { loggerMiddleware } from "./middleware/logger";
import { routes } from "./routes";
import type { AppContext } from "./types/env";

export function createApp(config: AppConfig) {
  const app = new Hono<AppContext>();

  /**
   * --------------------------------------------------------------------------
   * Request ID
   * --------------------------------------------------------------------------
   *
   * Generates an X-Request-Id for every incoming request.
   *
   * This identifier allows requests to be traced across:
   * - API logs
   * - Database queries
   * - Background jobs
   * - External services
   */
  app.use("*", requestId());

  app.use("*", createConfigMiddleware(config));

  // Built once per process (Node) / per isolate (Workers) — not per
  // request. Pino is cheap to .child() from but not cheap to construct.
  // Logger
  const baseLogger = createLogger(config);
  app.use("*", loggerMiddleware(baseLogger));

  // email provider
  const email = createEmailModule(process.env).email;
  app.use("*", async (c, next) => {
    c.set("email", email);
    await next();
  });
  /**
   * --------------------------------------------------------------------------
   * Request Timing
   * --------------------------------------------------------------------------
   *
   * Measures request processing time.
   *
   * The elapsed duration can later be logged with Pino
   * or exposed through monitoring and metrics.
   */

  app.use("*", timing());

  /**
   * --------------------------------------------------------------------------
   * Security Headers
   * --------------------------------------------------------------------------
   *
   * Protects the API against common browser attacks by sending
   * recommended HTTP security headers.
   *
   * Examples:
   * - X-Frame-Options
   * - X-Content-Type-Options
   * - Referrer-Policy
   *
   * Content Security Policy (CSP) is intentionally disabled because
   * this application serves JSON APIs rather than HTML pages.
   */
  app.use(
    "*",
    secureHeaders({
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: "cross-origin",
      referrerPolicy: "strict-origin-when-cross-origin",
      xFrameOptions: "DENY",
      xContentTypeOptions: "nosniff",
    }),
  );

  /**
   * --------------------------------------------------------------------------
   * Cross-Origin Resource Sharing (CORS)
   * --------------------------------------------------------------------------
   *
   * Controls which browser origins may access the API.
   *
   * Native mobile applications, Postman and server-to-server requests
   * do not send an Origin header and are therefore allowed.
   *
   * Development:
   *   - Allow every origin
   *
   * Production:
   *   - Restrict to trusted frontend domains
   */
  const allowedOrigins = config.CORS_ORIGINS;
  app.use(
    "*",
    cors({
      origin(origin) {
        if (!origin) return origin;
        return allowedOrigins.includes(origin) ? origin : null;
      },
      credentials: true,
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Authorization", "Content-Type", "X-Request-Id"],
      exposeHeaders: ["X-Request-Id"],
    }),
  );

  /**
   * --------------------------------------------------------------------------
   * Body Size Limit
   * --------------------------------------------------------------------------
   *
   * Rejects requests whose payload exceeds the configured size.
   *
   * This protects the API from:
   * - Accidental oversized requests
   * - Memory exhaustion
   * - Simple denial-of-service attacks
   *
   * File uploads should be streamed directly to object storage
   * instead of increasing this limit.
   */
  app.use(
    "*",
    bodyLimit({
      maxSize: 10 * 1024 * 1024, // 10 MB
    }),
  );

  app.use("*", deviceMiddleware);

  // Built once per process (Node) / per isolate (Workers) — not per
  // request. createDb() opens a postgres-js connection pool; constructing
  // it inside a request-scoped middleware would open (and on Node, leak)
  // a brand-new pool on every single request. See middleware/db.ts for
  // the full explanation.
  // baseLogger.info(`db:${config.APP_ENV}:${config.DATABASE_URL}`);
  /**
   * Attach a database instance to the request context.
   * Access anywhere in a route:
   * const db = c.get("db");
   */

  const db = createDb({
    DATABASE_URL: config.DATABASE_URL,
    ENVIRONMENT: config.APP_ENV,
  });
  app.use("*", dbMiddleware(db));

  // Better Auth middleware
  // const auth = createAuth(db, config);
  // app.use("*", betterAuthMiddleware(auth));

  //   JWT
  const jwt = new JwtService(config);
  app.use("*", jwtMiddleware(jwt));

  //   routes
  app.route("/api/v1", routes);

  app.notFound(notFoundHandler);

  /**
   * --------------------------------------------------------------------------
   * Global Error Handler
   * --------------------------------------------------------------------------
   *
   * Handles every uncaught exception thrown from:
   * - Middleware
   * - Route handlers
   * - Services
   *
   * Returning a consistent error response makes the API predictable.
   */
  app.onError(errorHandler);
  return app;
}
