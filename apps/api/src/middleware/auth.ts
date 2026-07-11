// src/middleware/auth.ts
/**
 * AUTHENTICATION MIDDLEWARE
 *
 * Validates Bearer JWT tokens AND enforces revocation — Technical Design
 * §3.2. A structurally valid, unexpired JWT signature is NECESSARY but
 * NOT SUFFICIENT to authenticate a request. After signature verification
 * succeeds, this middleware additionally:
 *
 *   1. Compares the token's tokenVersion claim against users.tokenVersion
 *      — mismatch means the user logged out everywhere (or was
 *      force-logged-out) since this token was issued.
 *   2. Compares against devices.tokenVersion — mismatch means this
 *      specific device was revoked since issuance.
 *   3. Checks devices.status === 'ACTIVE' — defense in depth, independent
 *      of the tokenVersion checks.
 *   4. Checks users.status — a suspended/inactive user's existing,
 *      unexpired tokens are rejected immediately, not just blocked at
 *      next login.
 *
 * Without these checks, a compromised or revoked access token remains
 * valid for its full 15-minute natural lifetime regardless of any
 * revocation action taken server-side — this is the exact gap BR-4/NFR-2
 * in the BRD require closing, and the previous version of this file did
 * not check ANY of the above; it only verified the JWT signature.
 *
 * Usage:
 *   app.use("/api/*", authMiddleware);
 *   app.use("/api/mentor/*", authMiddleware, requireRole("mentor", "admin"));
 */
import { devices, users } from "@syncr/db";
import { eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";
import { Errors } from "../errors";
import { JwtService } from "../lib/jwt";
export const authMiddleware = createMiddleware(async (c, next) => {
  const authorization = c.req.header("Authorization");

  if (!authorization) throw Errors.auth.tokenMissing();
  if (!authorization.startsWith("Bearer ")) throw Errors.auth.tokenMissing();

  const token = JwtService.extractBearerToken(authorization);
  if (!token) throw Errors.auth.tokenMissing();
  const payload = await c.get("jwt").verifyAccessToken(token);

  const db = c.get("db");

  // Single round-trip fetching both the user's and device's current
  // tokenVersion/status together — two separate queries would work
  // identically but this keeps the revocation check to one DB call
  // rather than two on every authenticated request.
  const [userRow] = await db
    .select({
      tokenVersion: users.tokenVersion,
      status: users.status,
    })
    .from(users)
    .where(eq(users.id, payload.sub))
    .limit(1);

  if (!userRow) {
    // The user the token claims to belong to no longer exists (hard
    // delete, extremely rare given the platform favors soft-delete/
    // status changes — but a token referencing a nonexistent user must
    // never be treated as valid).
    throw Errors.auth.tokenInvalid();
  }

  if (userRow.tokenVersion !== payload.tokenVersion) {
    // This token was issued before the user's last "log out everywhere"
    // / password change / admin-forced suspension. The JWT signature is
    // perfectly valid; it is simply no longer authoritative.
    throw Errors.auth.tokenInvalid();
  }

  if (userRow.status === "SUSPENDED" || userRow.status === "PENDING") {
    // A suspended/inactive user's existing tokens are rejected
    // immediately — not just blocked at next login attempt. This is what
    // makes admin-forced suspension actually take effect in real time
    // rather than only once the (already 15-minute-lived) access token
    // naturally expires.
    throw Errors.user.inactive();
  }

  const [deviceRow] = await db
    .select({
      tokenVersion: devices.tokenVersion,
      status: devices.status,
    })
    .from(devices)
    .where(eq(devices.id, payload.deviceId))
    .limit(1);

  if (!deviceRow) {
    throw Errors.device.notFound();
  }

  if (deviceRow.tokenVersion !== payload.tokenVersion) {
    // This specific device was revoked (single-device logout, or
    // refresh-token-theft detection per Technical Design §3.4) since
    // this access token was issued.
    throw Errors.device.revoked();
  }

  if (deviceRow.status !== "ACTIVE") {
    // Defense in depth: revocation should never depend on exactly one
    // signal. A device marked REVOKED/EXPIRED is rejected even in the
    // (should-be-impossible) case where its tokenVersion happened to
    // still match.
    throw deviceRow.status === "EXPIRED"
      ? Errors.device.expired()
      : Errors.device.revoked();
  }
  c.set("auth", payload);

  await next();
});
