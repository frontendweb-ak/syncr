import { createMiddleware } from "hono/factory";
import type { BetterAuthState } from "../lib/auth/better-auth";
import type { AppContext } from "../types/env";

export const betterAuthMiddleware = (auth: BetterAuthState) =>
  createMiddleware<AppContext>(async (c, next) => {
    c.set("betterAuth", auth);
    await next();
  });
